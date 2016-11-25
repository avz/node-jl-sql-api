# `jl-sql-api` [![Build Status](https://travis-ci.org/avz/node-jl-sql-api.svg?branch=master)](https://travis-ci.org/avz/node-jl-sql-api) - SQL for JS objects streams (WiP)

Библиотека позволяет оперировать потоками объектов через SQL. Этот пакет включает только API, если вы ищете CLI-утилиту для работы с JSON-потоками, то переходите по этой ссылке: https://github.com/avz/jl-sql

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
