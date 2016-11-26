# `jl-sql-api` - SQL for JS objects streams (WiP)
[![Build Status](https://travis-ci.org/avz/node-jl-sql-api.svg?branch=master)](https://travis-ci.org/avz/node-jl-sql-api)

Библиотека позволяет оперировать потоками объектов через SQL. Этот пакет включает только API, если вы ищете CLI-утилиту для работы с JSON-потоками, то переходите по этой ссылке: https://github.com/avz/jl-sql.

Реализация позволяет работать с потенциально бесконечными потоками - для сортировки и группировки больших объёмов автоматически задействуется механизм внешней сортировки через стандартную unix-овую утилиту `sort`, который, в свою очередь, может использовать ФС для храннения данных, поэтому весь датасет не обязан помещаться в RAM. Для запросов, которые не требуют сортировки, используется потоковая обработка, т.е. датасет не загружается в память целиком, а обрабатывается частями.

* [Примеры](#Примеры)
* [SQL](#sql)
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
);
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
);
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

## API

### Overview

* `const JlSqlApi = require('jl-sql-api')`
	* `new JlSqlApi([options])` -> `JlSqlApi`
	* `JlSqlApi.prototype.query(sql)` -> `Select`
* `Select.prototype`
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
* `dataSourceResolvers` - массив ресолверов источников данных, описано в разделе [Динамический ресолвинг источников данных](#Динамический-ресолвинг-источников-данных)
* `sortOptions`
	* `inMemoryBufferSize` - максимальное количество __объектов__, которое может сортироваться в памяти. При исчерпании этого лимита используется механизм внешней сортировки через утилиту `sort`. По умолчанию: 16000
	* `bufferSize` - размер буфера внешней сортировки (утилита `sort`) __в байтах__. По умолчанию: 64Мб
	* `tmpDir` - каталог, куда будут сохраняться временные файлы для внешней сортировки (утилита `sort`). Если опция не указана, то используется значение `tmpDir` из корневого объекта опций, если не указано и оно, то значение по умолчанию можно посмотреть в `man sort` в описании опции `-T`
* `joinOptions`
	* `maxKeysInMemory` - максимальное __кол-во__ ключей в буфере JOIN в памяти, при превышении этого значения задействуются временные файлы в каталоге `tmpDir`
	* `tmpDir` - каталог, в котором размещаются временные файлы. Если не указано, то берётся значение из корневого объекта `options`, если не указано и оно, то `os.tmpdir()`

#### Пример

```javascript
const jlSqlApi = new JlSqlApi({
	tmpDir: '/tmp',
	sortOptions: {
		tmpDir: '/tmp/sort'
#	},
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

