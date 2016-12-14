# `jl-sql-api` - SQL for JS objects streams
[![Build Status](https://travis-ci.org/avz/node-jl-sql-api.svg?branch=master)](https://travis-ci.org/avz/node-jl-sql-api)

Библиотека позволяет оперировать потоками объектов через SQL. Этот пакет включает только API, если вы ищете CLI-утилиту для работы с JSON-потоками, то переходите по этой ссылке: https://github.com/avz/jl-sql.

Реализация позволяет работать с потенциально бесконечными потоками - для сортировки и группировки больших объёмов автоматически задействуется механизм внешней сортировки через стандартную unix-овую утилиту `sort`, который, в свою очередь, может использовать ФС для храннения данных, поэтому весь датасет не обязан помещаться в RAM. Для запросов, которые не требуют сортировки, используется потоковая обработка, т.е. датасет не загружается в память целиком, а обрабатывается частями.

* [Примеры](#Примеры)
* [SQL](#sql)
	* [Константы](#Константы)
	* [Идентификаторы](#Идентификаторы)
	* [Приведение типов](#Приведение-типов)
	* [Работа с датами](#Работа-с-датами)
	* [Биндинги](#Биндинги)
* [API](#api)
	* [Overview](#overview)
	* [Объект `options`](#Объект-options)
	* [Форматы данных](#Форматы-данных)

## Примеры

### Общий для всех примеров код

```javascript
const JlSqlApi = require('jl-sql-api');

const api = new JlSqlApi;
```

### Получение потока JSON-объектов с STDIN, группировка и отдача результата в JSON в STDOUT

Вариант работы через `pipe()`

```javascript
process.stdin
	.pipe(
		api.query('SELECT key, SUM(value) AS sum GROUP BY key')
			.fromJsonStream()
			.toJsonStream()
	)
	.pipe(process.stdout)
;
```

Аналог без `pipe()`

```javascript
api.query('SELECT key, SUM(value) AS sum GROUP BY key')
	.fromJsonStream(process.stdin)
	.toJsonStream(process.stdout)
;
```

Вход

```
{"key": 2, "value": 2}
{"key": 1, "value": 3}
{"key": 3, "value": 6}
{"key": 3, "value": 4}
{"key": 1, "value": 5}
{"value": 7}
{"key": null, "value": 8}
```

Выход

```
{"sum":7}
{"key":1,"sum":8}
{"key":2,"sum":2}
{"key":3,"sum":10}
{"key":null,"sum":8}
```

### Из STDIN в фиксированный массив

```javascript
api.query('SELECT key, SUM(value) AS sum GROUP BY key')
	.fromJsonStream(process.stdin)
	.toArrayOfObjects(function(objects) {
		console.log(objects);
	})
;
```

### JOIN

Для работы JOIN'ов необходимо задать дополнительные входные потоки (можно назвать их виртуальными таблицами), которые будуть присоедиться к основному:

```javascript
api.query('SELECT id AS mid, @child.field INNER JOIN child ON @child.mainId = id')
	.fromArrayOfObjects([
		{"id": 1},
		{"id": 2}
	])
	.addArrayOfObjectsStream('child', [
		{"mainId": 1, "field": 11},
		{"mainId": 1, "field": 12},
		{"mainId": 2, "field": 21},
		{"mainId": 3, "field": 31},
	])
	.toArrayOfObjects((r) => {
		console.log(r);
	})
```

На выходе
```
[ { mid: 1, field: 11 },
  { mid: 1, field: 12 },
  { mid: 2, field: 21 } ]
```

Специальный синтаксис `@child` введён для того, чтобы явно указать интерпретатору, что мы работаем именно с "таблицей" `child`, а не с полем с именем `child` у основной таблицы. Альясы можно задавать через `AS`: `... INNER JOIN child AS @childAlias ON @childAlias.mainId = id`. Для основной таблицы зарезервировано имя `@`, т.е. если надо явно указать, что мы обращаемся к основной таблице, то можно написать `... ON @childAlias.mainId = @.id`. Если в самом объекте содержится символ `@`, то можно заэкранировать имя через backquote: ``smth = `@child`.field``, тогда поле с именем `'@child'` будет искаться в основной таблице.

## SQL

Поддерживаются следующие виды запросов:

* `SELECT field[AS alias][...] [[{LEFT|INNER}] JOIN ... ON expression...] [WHERE ...] [GROUP BY ...] [HAVING ...]`
* `INSERT {row1}[, ...]` - добавляет указанные объекты в конец потока
* `UPDATE SET field = 'value'[, ...] [WHERE expression]` - изменяет строки, подпадающие под условия в WHERE, по указанным в `SET` правилам
* `DELETE [WHERE expression]` - удаляет строки по условию

В целом, диалект похож на диалект MySQL и имеет такие особенности:

* не поддерживается `FROM` т.к. входной поток передаётся через API явным образом
* поддерживается только `INNER JOIN` и `LEFT JOIN`
* выражение в `JOIN ON` может быть только точным соответствием (оператор `=`), например:
	* `@user.id = userId`
	* `@post.sn = sn + 1`
* не поддерживается `LIMIT`
* для `ORDER BY` ключевое выражение должно быть известного типа (строка или число), при использовании арифметических операций в выражении, тип можно не указывать явно - он будет определён автоматически. Смотри подробности в разделе [Приведение типов](#Приведение-типов)
	* `ORDER BY NUMBER(value)` - сортировка по числовому значению
	* `ORDER BY STRING(value)` - сортировка по строковому значению
	* `ORDER BY value + 1` - сортировка по числовому значению
	* `ORDER BY value` - ошибка, нужно указать тип явно через функцию `NUMBER()` или `STRING()`


### Константы

Строковые константы нужно оборачивать в одинарные (`'`) или в двойные (`"`) кавычки. Ксли в строке должны содержаться кавычки, то они экранируются символом `\`. Специальные последовательности `\n` и `\t` конвертируются, соответственно, в символ новый строки и символ табуляции.

### Идентификаторы

Идентификаторы - это пути до нужного поля в строке данных. Идентификатор может быть как простым, т.е. обращающимся к ключу верхнего уровня объекта, так и более сложным, уходящим в глубину. Идентификаторы пути разделяются между собой символом `.`

Например, так можно обратиться к каждому из полей данных
```javascript
{
  top: {          // `top`
    sub: {        // `top`.`sub`
      value: 10   // `top`.`sub`.`value`
    }
  },
  value: 2        // `value`
}
```

Здесь для наглядности все идентификаторы обёрнуты в символы обрытной кавычки (back quote), но делать это обязательно только если в идентификаторе используются спецсимволы.

### Приведение типов

Отсутствие чёткой схемы данных создаёт некоторые трудности в обработке, связанные, с определение и приведением типов полей, например, можно попытаться отсортировать строки по полю, значения в котором могут быть разных типов в разных строках. Именно поэтому, как было указано выше, `ORDER BY` требует явного указания типа выражения, если невозможно определить тип автоматически.

Автоматическое определение типов работает в следующих случаях:

* выражение трактуется как число если
	* результат выражения - это результат выполнения арифметическиой операцияи
	* результат выражения - это значение, возвращаемое из одной из стандартных функций, для которых явно задан числовой тип возвращаемого значение, например: `FLOOR()`, `ROUND()`, `CEIL()`
* выражение трактуется как строка если
	* результат выражения - это значение, возвращаемое из одной из стандартных функций, для которых явно задан строковый тип возвращаемого значение, например: `CONCAT()`

#### Строгое сравнение

Оператор сравнения `=` работает по тем же правилам, что и оператор `==` языка JavaScript, если нужно сравнить значение на строгое соответствие и типу и значению, то следует использовать оператор строгого сравнения - `===`.

#### Операторы `IN` и `STRICT IN`

Оператор `IN` использует для сравнения значений оператор `=`, поэтому выражение `"10" IN (10)` будет истинным, в то время как оператор `STRICT IN` использует внутри оператор `===`, поэтому `"10" STRICT IN (10)` будет ложным.

#### Значения `null` и `undefined`

При обработке делаются некоторые различия между полями, со значением `null` и отсутствующими полями, например, при выполнении запроса

```sql
SELECT value
```

на строках

```
{"id": 1, "value": 1}
{"id": 2, "value": null}
{"id": 3}
```

на выходе мы получим

```
{"value": 1}
{"value": null}
{}
```

т.е. `null` - это обычное значение, не подразумевающее никакой особенной обработки, в то время как обращение к несуществующему полю (`undefined`) вообще не будет создавать соотвествующего поля в результирующей строке.

### Работа с датами

Все функции и операторы работы с датами, кроме `FROM_UNIXTIME()` могут оперировать только с объектами класса [Date](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date) и строками в формате, понимаемом конструктором [Date](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date). Для работы с unix timestamp нужно явным образом скорвертировать unix timestamp в дату функцией `FROM_UNIXTIME(unixTimestamp)`.

#### Временная зона

Манипуляции с датами происходят по локальной таймзоне, на настоящий момент единственная возможность поменять это поведение - это поменять переменную окружения `TZ` при запуске процесса NodeJS. Например
```
% TZ=UTC node main.js ...
```

#### Функции

* `FROM_UNIXTIME(unixTimestamp)` - сконвертировать unix timestamp в дату
* `UNIX_TIMESTAMP([dateString])` - сконвертировать текущее время или переданный `dateString` в unix timestamp
* `DATE([dateString])` - получить текущую дату в формате `YYYY-MM-DD`. Если передан опциональный аргумент `dateString`, то дата высчитывает от переданной строки, а не от текущего времени
* `NOW()` - получить текущую дату и время

#### Операторы и ключевые слова

Операторы можно использовать для арифметики с датами. Например, таким образом можно добавить 1 день и 2 часа к текущему времени:
```sql
SELECT NOW() + INTERVAL 1 DAY 2 HOUR
```

А так, отнять от даты:
```sql
SELECT NOW() - INTERVAL 1 DAY 2 HOUR
```

Полный список поддерживаемых единиц измерения

* `YEAR`
* `MONTH`
* `DAY`
* `HOUR`
* `MINUTE`
* `SECOND`

Операции можно комбинировать

```sql
SELECT NOW() + INTERVAL 1 YEAR 1 MONTH - INTERVAL 1 DAY
```

### Биндинги

Биндинги позволяют безопасно с точки зрения SQL-инъекций вставить в SQL какое-либо значение, например

```sql
SELECT * WHERE field = :field
```
где `:field` - это "слот", значение которого должно быть задано через метод [`Select.prototype.bind()`](#selectprototypebindident-value).

Биндить можно не только данные, но и названия полей, для этого имя биндинга нужно взять в квадратные скобки

```sql
SELECT * WHERE [:field] = :value
```

Биндинги бывают двух типов:
* биндинг одного значения, форма записи: `:bind` (один символ `:` перед именем)
* биндинг списка значений, форма записи: `::bind` (2 символа `::` перед именем)

#### Биндинг одного значения

Биндинг одного значения в SQL можно использовать, например, для аргумента функции, для операнда в бинарных и унарных операторах и вообще во всех случаях, где в SQL подразумевается какое-то одно выражение

```sql
SELECT * WHERE id = :id
// при :id = 1 запрос будет иметь вид SELECT * WHERE id = 1

SELECT * WHERE value > FLOOR(:id)
// при :id = 1 запрос будет иметь вид SELECT * WHERE value > FLOOR(1)

SELECT id, amount * :price AS revenue WHERE value > amount * :price

SELECT * WHERE [:field] = :value
// отфильтровать поле с именем, взятым из значения биндинга :field
```

#### Биндинг списка значений

Этот вид биндинга более сложный и позволяет заменять не единичные операнды и выражения, а целые списки. Например, с помощью такого биндинга можно подставить сразу несколько аргументов функции

```sql
SELECT * WHERE id IN(::ids)
// при ::ids = [1, 2, 3] запрос будет иметь вид: SELECT * WHERE id IN(1, 2, 3)

SELECT IF(enabled, ::trueFalse)
// при ::ids = ['true', 'false'] запрос будет иметь вид: SELECT IF(enabled, 'true', 'false')

SELECT * WHERE [::fieldPath] IN(::values)
// путь до поля будет взят из значения биндинга ::fieldPath, например,
// если ::fieldPath = ['key', 'subkey'], то запрос превратится в
// SELECT * WHERE key.subkey IN(::values)

SELECT * WHERE [:name1].[:name2].[::tail] IN(::values)
// в этом случае имя сформируется из значений всех трёх биндингов
```

## API

### Overview

* `const JlSqlApi = require('jl-sql-api')`
	* `new JlSqlApi([options])` -> `JlSqlApi`
	* `JlSqlApi.prototype.query(sql)` -> `Select`
* `Select.prototype`
	* [`bind(ident, value)`](#selectprototypebindident-value) -> `this`
	* [`fromJsonStream([readableStream])`](#selectprototypefromjsonstreamstream) -> `SelectFrom`
	* [`fromObjectsStream([readableStream])`](#selectprototypefromobjectsstreamstream) -> `SelectFrom`
	* [`fromArrayOfObjects([readableStream])`](#selectprototypefromarrayofobjectsarray) -> `SelectFrom`
* `SelectFrom.prototype`
	* [`addJsonStream(location, readableStream)`](#selectfromprototypeaddjsonstreamlocation-readablestream) -> `this`
	* [`addObjectsStream(location, readableStream)`](#selectfromprototypeaddobjectsstreamlocation-readablestream) -> `this`
	* [`addArrayOfObjects(location, array)`](#selectfromprototypeaddarrayofobjectslocation-array) -> `this`
	* [`toJsonStream([writableStream])`](#selectfromprototypetojsonstreamstream) -> `Transform`
	* [`toObjectsStream([writableStream])`](#selectfromprototypetoobjectsstreamstream) -> `Transform`
	* [`toArrayOfObjects(callback(objects))`](#selectfromprototypetoarrayofobjectscallbackarray) -> `WritableStream`

Создание запроса происходит в несколько этапов:

1. Создаём инстанс JlSqlApi с необходимыми опциями: `const jlSqlApi = new JlSqlApi({});`
2. Создаём объект запроса из SQL: `const query = jlSqlApi.query('SELECT SUM(price)');`
3. Создаём привязку запроса к источникам данных методами `from*()` и `add*()` (набор методов `add*()` опционален и требуется только для запросов с JOIN)
4. Выбираем куда и в каком формате отдавать результат выполнения через методы `to*()`

### Объект `options`

* `tmpDir` - значение по умолчанию для пути до каталога хранения временных файлов, используемых при сортировке и JOIN'е. Это значение может быть перезаписано специфичными значениями `tmpDir` в соответствующем объекте опций
* `forceInMemory` - включает режим, при котором все манипуляции с данными происходят только в памяти процесса, ФС и сторонние программы (такие как `sort`) не используются. По умолчанию `false`
* `dataSourceResolvers` - массив ресолверов источников данных, описано в разделе [Динамический ресолвинг источников данных](#Динамический-ресолвинг-источников-данных)
* `sortOptions`
	* `inMemoryBufferSize` - максимальное количество __объектов__, которое может сортироваться в памяти. При исчерпании этого лимита используется механизм внешней сортировки через утилиту `sort`. По умолчанию: 16000
	* `bufferSize` - размер буфера внешней сортировки (утилита `sort`) __в байтах__. По умолчанию: 64Мб
	* `tmpDir` - каталог, куда будут сохраняться временные файлы для внешней сортировки (утилита `sort`). Если опция не указана, то используется значение `tmpDir` из корневого объекта опций, если не указано и оно, то значение по умолчанию можно посмотреть в `man sort` в описании опции `-T`
	* `forceInMemory` - не использоваться утилиту `sort` для сортировки. Все манипуляции будут производиться в памяти процесса. Переопределяет значение `forceInMemory` из корня опций. При включении этой опции игнорируются опции `tmpDir`, `bufferSize`, `inMemoryBufferSize`
* `joinOptions`
	* `maxKeysInMemory` - максимальное __кол-во__ ключей в буфере JOIN в памяти, при превышении этого значения задействуются временные файлы в каталоге `tmpDir`
	* `tmpDir` - каталог, в котором размещаются временные файлы. Если не указано, то берётся значение из корневого объекта `options`, если не указано и оно, то `os.tmpdir()`
	* `forceInMemory` - не ФС для хранения временных данных. Все манипуляции будут производиться в памяти процесса. Переопределяет значение `forceInMemory` из корня опций. При включении этой опции игнорируются опции `maxKeysInMemory`, `tmpDir`

#### Пример

```javascript
const jlSqlApi = new JlSqlApi({
	tmpDir: '/tmp',
	sortOptions: {
		tmpDir: '/tmp/sort'
	},
	joinOptions: {
		maxKeysInMemory: 100000
	}
});
```

### Форматы данных

Как вы могли заметить, методы для выбора источников и приёмника данных имеют похожие имена, формирующиеся по правилу `{from|add|to}{JsonStream|ObjectsStream|ArrayOfObjects}`, например, `fromJsonStream()`. Первая часть означает, соответственно источник, дополнительный источник и приёмник, а вторая - формат данных на входе или выходе.

* `JsonStream` - обычный `stream.Readable` поток байтов/текста, данные в котором представлены в виде объектов, закодированных в JSON и отделённых друг от друга символом перевода строки (`\n` === `0x0A`). Символы перевода строк внутри одного объекта не допускаются: один объект должен занимать строго одну строку. Пример таких данных можно посмотреть в разделе "Примеры"
* `ObjectsStream` - поток `stream.Readable` с опцией `{objectMode: true}`, который вместо текста оперирует потоком объектов
* `ArrayOfObjects` - означает, что данные нужно передать или получить в виде обычного массива объектов, потоки тут не используются

### `Select.prototype.bind(ident, value)`

Биндит значение для запроса (смотри раздел [Биндинги](#Биндинги)).

* `ident` - имя биндинга, включая `:` для биндлингов одного значения, и `::` для списочных биндингов
* `value` - значение, в которое раскрывается биндинг. Должно быть массивом для списочных биндингов

Метод возвращает `this`, так что можно использовать цепочечную нотацию.

### `Select.prototype.fromJsonStream([stream])`
### `Select.prototype.fromObjectsStream([stream])`
### `Select.prototype.fromArrayOfObjects(array)`

Создать привязку запроса к основному источнику данных, этот источник используется в качестве `FROM` для SQL-запроса. Источником может быть как поток (методы `fromJsonStream()`, `fromObjectStream()`), так и массив объектов (метод `fromArrayOfObjects()`).

Если в потоковый метод не передать необязательный аргумент `stream`, то будет подразумеваться, что данные будут передаваться в поток, который вернёт один из методов из набора `to*()` через станарный механизм потоков NodeJS: `write()` и `pipe()`.

Все этим методы возвращают инстанс класса `SelectFrom`.

### `SelectFrom.prototype.addJsonStream(location, readableStream)`
### `SelectFrom.prototype.addObjectsStream(location, readableStream)`
### `SelectFrom.prototype.addArrayOfObjects(location, array)`

Добавить к запросу дополнительный поток данных, который может быть использован для `JOIN` в запросе.

`location` - массив строк или строка, представляющая собой имя таблицы, по которому этот источник будет привязываться к запросу `SELECT ... JOIN <name>`. Имя может быть многоуровневым, например `user`.`payments`, в этом случае в `location` нужно указать массив `['user', 'payment']`, для одноуровневых имён допускается передавать как массив из одного элемента, так и просто строку

Пример

```javascript
jlSqlApi.query('SELECT SUM(price) INNER JOIN user.payments ON @payments.userId = id')
	.fromJsonStream(process.stdin)
	.addArrayOfObjects(['user', 'payment'], [
		{userId: 10, price: 20},
		{userId: 10, price: 10},
		{userId: 15, price: 1}
	])
	.toJsonStream(process.stdout)
```

Тут стоит также остановиться на записи `@payments.userId`: каждый источник данных обязан иметь своё уникальное имя в запросе, имена источников всегда начинаются с символа `@` и не должны быть обёрнуты в back quotes (`` ` ``). Источники, добавленные через `add*()` по умолчанию получают имена по последнему элементу `location`, поэтому в данном случае мы обращаемся к таблице как `@payment`.

Если возникает коллизия имён, например, если мы подключили два источника с именами `user.payment` и `company.payment` то нужно явно указывать альяс для одного из источников: `INNER JOIN company.payment AS @companyPayment`.

В API предусмотрена возможность динамического ресолвинга имён источников, так что не обязательно явно прописывать каждый из них. Подробнее об этом можно прочитать в разделе [Динамический ресолвинг источников данных](#Динамический-ресолвинг-источников-данных).

### `SelectFrom.prototype.toJsonStream([stream])`
### `SelectFrom.prototype.toObjectsStream([stream])`
### `SelectFrom.prototype.toArrayOfObjects(callback(array))`

Через этот набор методов указыаается формат и приёмник данных на выходе, всё аналогично набору `from*()`, за исключением того, что в метод `toArrayOfObjects()` нужно передать обработчик с одним аргументом - массивом выходных объектов.

Если параметр `stream` не указан у потоковых функций, то данные можно получить через стандартный механизм `stream.Readable`: `.on('data', ...)`, `.on('readable', ...)`, `.pipe(destination)` и т.п.


### Динамический ресолвинг источников данных

Часто возникает ситуация, когда мы не можем заранее добавить дополнительные источники данных через методы `add*()`, например, когда SQL-запрос вводится пользователем, который хочет работать с файлов в ФС.

Для решения этой проблемы в объекте `options` предусмотрено поле `dataSourceResolvers`, в котором можно передать массив объектов-ресолверов.

Объект-ресолвер обязан быть наследником класса `require('jl-sql-api').DataSourceResolver` и реализовывать как минимум метод `resolve()`. Не обязательно, но желательно, реализовать также метод `extractAlias()`.

#### `resolve(location)`

Используется для создания `stream.Readable` по названию "таблицы" из SQL - если запрос содержит такой код `INNER JOIN user.payment ... INNER JOIN transaction`, то этот метод вызовется два раза: один раз для таблицы `user.payment` с агументом `["user", "payment"]` и второй раз для `transaction` с аргументом `["transaction"]`.

Метод может вернуть либо `stream.Readable`, либо `null`, если источник определить не получилось. Все ресолверы в массиве будут перебираться по порядку пока какой-нибудь не вернёт не-`null`. Если все вернули `null`, то идёт проверка по источникам, добавленным явно через `add*()`.

#### `extractAlias(location)`

Используется для определения альяса таблицы, если он явно не задан пользователем через `AS`, например, `... INNER JOIN user.payment ON ...`.

Метод должен вернуть строку или `null`, если альяс не определён.

#### Реальный пример

Такой код используется в утилите `jl-sql` для динамического создания источника данных на основе пути до файла ([DataSourceFileResolver.js](https://github.com/avz/jl-sql/blob/master/src/DataSourceFileResolver.js))

```javascript
const path = require('path');
const fs = require('fs');
const DataSourceResolver = require('jl-sql-api').DataSourceResolver;

class DataSourceFileResolver extends DataSourceResolver
{
	resolve(location)
	{
		if (location.length !== 1) {
			return null;
		}

		return fs.createReadStream(location[0]);
	}

	extractAlias(location)
	{
		if (location.length !== 1) {
			return null;
		}

		return path.parse(location[0]).name;
	}

}

module.exports = DataSourceFileResolver;
```
