# `jl-sql-api` [![Build Status](https://travis-ci.org/avz/node-jl-sql-api.svg?branch=master)](https://travis-ci.org/avz/node-jl-sql-api)

## API

```javascript
const Api = require('jl-sql-api');
```

### `Api()`


### `Api.prototype.query(sql)`

#### Arguments

 - `sql` - SQL SELECT query

#### Return value

Instance of `Select`


### `Select.prototype.fromJsonStream([stream])`

#### Arguments

 - `stream` source JSON stream. Default: nothing, in this case data expected from `.write()` or `.pipe()`

#### Return value

Instance of `SelectFrom`


### `Select.prototype.fromObjectsStream([stream])`

#### Arguments

 - `stream` source objects stream. Default: nothing, in this case data expected from `.write()` or `.pipe()`

#### Return value

Instance of `SelectFrom`


### `Select.prototype.fromArrayOfObject(array)`

#### Arguments

 - `array` array of data objects to aggregate

#### Return value

Instance of `SelectFrom`

### `SelectFrom.prototype.toJsonStream([stream])`
### `SelectFrom.prototype.toObjectsStream([stream])`
### `SelectFrom.prototype.toArrayOfObjects(callback)`

## Examples

Common code

```javascript
const JlSqlApi = require('jl-sql-api');

const api = new JlSqlApi;
```

### From JSON stream (e.g, stdin) to JSON stream (e.g. stdout)

With `pipe()`

```javascript
process.stdin
	.pipe(
		api.query(process.argv[2])
			.fromJsonStream()
			.toJsonStream()
	)
	.pipe(process.stdout)
;
```

Directly

```javascript
api.query('SELECT * WHERE a = 1')
	.fromJsonStream(process.stdin)
	.toJsonStream(process.stdout)
;
```

### From array to JSON stream

With `pipe()`

```javascript
api.query('SELECT * WHERE a = 1')
	.fromArrayOfObjects([
		{"a": 1, "b": 12, "c": 13},
		{"a": 2, "b": 13, "c": 14}
	])
	.toJsonStream()
	.pipe(process.stdout)
;
```

Directly

```javascript
api.query('SELECT * WHERE a = 1')
	.fromArrayOfObjects([
		{"a": 1, "b": 12, "c": 13},
		{"a": 2, "b": 13, "c": 14}
	])
	.toJsonStream(process.stdout)
;
```


### From array to array

```javascript
api.query('SELECT * WHERE a = 1')
	.fromArrayOfObjects([
		{"a": 1, "b": 12, "c": 13},
		{"a": 2, "b": 13, "c": 14}
	])
	.toArrayOfObjects(array => {
		console.log(array);
	})
;
```
