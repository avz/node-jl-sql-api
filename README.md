# `jl-sql-api` [![Build Status](https://travis-ci.org/avz/node-jl-sql-api.svg?branch=master)](https://travis-ci.org/avz/node-jl-sql-api) - SQL for JS objects streams (WiP)

Библиотека позволяет оперировать потоками объектов через SQL. Этот пакет включает только API, если вы ищете CLI-утилиту для работы с JSON-потоками, то переходите по этой ссылке: https://github.com/avz/jl-sql.

Реализация позволяет работать с потенциально бесконечными потоками - для сортировки и группировки больших объёмов автоматически задействуется механизм внешней сортировки через стандартную unix-овую утилиту `sort`, который, в свою очередь, может использовать ФС для храннения данных, поэтому весь датасет не обязан помещаться в RAM. Для запросов, которые не требуют сортировки, используется потоковая обработка, т.е. датасет не загружается в память целиком, а обрабатывается частями.

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

## API

### Overview

* `const JlSqlApi = require('jl-sql-api')`
	* `new JlSqlApi([options])` -> `JlSqlApi`
	* `JlSqlApi.prototype.query(sql)` -> `Select`
* `Select.prototype`
	* `fromJsonStream([readableStream])` -> `SelectFrom`
	* `fromObjectsStream([readableStream])` -> `SelectFrom`
	* `fromArrayOfObjects([readableStream])` -> `SelectFrom`
* `SelectFrom.prototype`
	* `addJsonStream(location, readableStream)` -> `this`
	* `addObjectsStream(location, readableStream)` -> `this`
	* `addArrayOfObjects(location, array)` -> `this`
	* `toJsonStream([writableStream])` -> `Transform`
	* `toObjectsStream([writableStream])` -> `Transform`
	* `toArrayOfObjects(callback(objects))` -> `WritableStream`

Создание запроса происходит в несколько этапов:

1. Создаём инстанс JlSqlApi с необходимыми опциями: `const jlSqlApi = new JlSqlApi({});`
2. Создаём объект запроса из SQL: `const query = jlSqlApi.query('SELECT SUM(price)');`
3. Создаём привязку запроса к источникам данных методами `from*()` и `add*()` (набор методов `add*()` опционален и требуется только для запросов с JOIN)
4. Выбираем куда и в каком формате отдавать результат выполнения через методы `to*()`

### Объект `options`

* `tmpDir` - значение по умолчанию для пути до каталога хранения временных файлов, используемых при сортировке и JOIN'е. Это значение может быть перезаписано специфичными значениями `tmpDir` в соответствующем объекте опций
* `dataSourceResolvers` - массив ресолверов источников данных, описано в разделе "Динамический ресолвинг источников"
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

В API предусмотрена возможность динамического ресолвинга имён источников, так что не обязательно явно прописывать каждый из них. Подробнее об этом можно прочитать в разделе "Динамический ресолвинг источников".

### `SelectFrom.prototype.toJsonStream([stream])`
### `SelectFrom.prototype.toObjectsStream([stream])`
### `SelectFrom.prototype.toArrayOfObjects(callback(array))`

Через этот набор методов указыаается формат и приёмник данных на выходе, всё аналогично набору `from*()`, за исключением того, что в метод `toArrayOfObjects()` нужно передать обработчик с одним аргументом - массивом выходных объектов.

Если параметр `stream` не указан у потоковых функций, то данные можно получить через стандартный механизм `stream.Readable`: `.on('data', ...)`, `.on('readable', ...)`, `.pipe(destination)` и т.п.
