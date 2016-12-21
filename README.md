# `jl-sql-api` - SQL for JS objects streams
[![Build Status](https://travis-ci.org/avz/node-jl-sql-api.svg?branch=master)](https://travis-ci.org/avz/node-jl-sql-api)

The library allows to operate on streams of objects by SQL queries such as `SELECT`, `UPDATE`, `DELETE`, `INSERT`. This package contains only API, if you are looking for a CLI-utility for working with JSON streams, go to https://github.com/avz/jl-sql.

### [Try it now on runkit.com!](https://runkit.com/npm/jl-sql-api)

The implementation allows you to work with potentially infinite streams. To sort and group large volumes of automatically activated external sorting using the unix utility `sort`, which can use a filesystem to store temporary data. For queries that do not require sorting stream processing is used, so dataset not loaded into memory entirely.

* [Examples](#examples)
* [SQL](#sql)
	* [Constants](#constants)
	* [Identifiers](#identifiers)
	* [Type casting](#type-casting)
	* [Dates](#dates)
	* [Bindings](#bindings)
* [API](#api)
	* [Overview](#overview)
	* [`options` object](#options-object)
	* [Data formats](#data-formats)

## Examples

### Common code

```javascript
const JlSqlApi = require('jl-sql-api');

const api = new JlSqlApi;
```

### Make objects from JSON from STDIN, group and write it in JSON to STDOUT

Working with `pipe()`

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

Wirking with specified stream directly

```javascript
api.query('SELECT key, SUM(value) AS sum GROUP BY key')
	.fromJsonStream(process.stdin)
	.toJsonStream(process.stdout)
;
```

Input

```
{"key": 2, "value": 2}
{"key": 1, "value": 3}
{"key": 3, "value": 6}
{"key": 3, "value": 4}
{"key": 1, "value": 5}
{"value": 7}
{"key": null, "value": 8}
```

Output

```
{"sum":7}
{"key":1,"sum":8}
{"key":2,"sum":2}
{"key":3,"sum":10}
{"key":null,"sum":8}
```

### From JSON from STDIN to static array

```javascript
api.query('SELECT key, SUM(value) AS sum GROUP BY key')
	.fromJsonStream(process.stdin)
	.toArrayOfObjects(function(objects) {
		console.log(objects);
	})
;
```

### JOIN

To work JOINS s need to specify additional input streams (you can call them virtual tables), which will join to the main stream:

```javascript
api.query('SELECT id AS mid, @child.field INNER JOIN child ON @child.mainId = id')
	.fromArrayOfObjects([
		{"id": 1},
		{"id": 2}
	])
	.addArrayOfObjects('child', [
		{"mainId": 1, "field": 11},
		{"mainId": 1, "field": 12},
		{"mainId": 2, "field": 21},
		{"mainId": 3, "field": 31},
	])
	.toArrayOfObjects((r) => {
		console.log(r);
	})
```

Output
```
[ { mid: 1, field: 11 },
  { mid: 1, field: 12 },
  { mid: 2, field: 21 } ]
```

The special syntax `@child` is introduced in order to explicitly indicate to the interpreter that we work with "table" `child`, and not with a field named `child` of the main table. Aliases can be set via `AS`: `... INNER JOIN child AS @childAlias ON @childAlias.mainId = id`. For the main table reserved name,`@`, i.e. if it is necessary to specify explicitly that we refer to the main table, you can write `... ON @childAlias.mainId = @.id`. If the object contains the ` @ ` symbol, it is possible to quote the name using backquote: `smth = `@child`.field`, then a field named `@child` will be searched in the main table.

## SQL

Supported queries:

* `SELECT field[AS alias][...] [[{LEFT|INNER}] JOIN ... ON expression...] [WHERE ...] [GROUP BY ...] [HAVING ...]`
* `INSERT VALUES {row1}[, ...]` - add object(s) to end of the stream
* `UPDATE SET field = 'value'[, ...] [WHERE expression]` - update rows
* `DELETE [WHERE expression]` - delete rows

In general, a dialect similar to the dialect of MySQL and has the following features:

* `FROM` is not supported because the input stream is passed via API to explicitly
* only `INNER JOIN` and `LEFT JOIN` is supported
* `ON` need to be equal-expression:
	* `@user.id = userId`
	* `@post.sn = sn + 1`
* `LIMIT` is not supported
* for `ORDER BY` key-expression must be of a known type (string or number). When using arithmetic expression, the type will be determined automatically. See details in section [Type Casting](#type-casting)
	* `ORDER BY NUMBER(value)` - sort by numeric value
	* `ORDER BY STRING(value)` - sort by string value
	* `ORDER BY value + 1` - sort by numeric value
	* `ORDER BY value` - warning: nee to specify type


### Constants

String constants need to wrap in single (`'`) or double (`"`) quotes. If the string contains quotes they are escaped by a ` \` character. The special sequence `\n` and `\t` is converted to the newline character and the tab character.

### Identifiers

Identifier is the path to the desired field in the data row. Identifier can point to multiple levels of nested complex object. The levels are separated by `.`character

For example
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

For clarity, all the identifiers are wrapped in the characters in back quotes, but be sure to do it only if the identifier is used special characters.

### Type casting

The lack of a clear schema of the data creates some difficulties in the processing associated with the definition and conversion of field types, for example, you can try to sort the rows by field values which can be of different types in different rows. That is why, as mentioned above, `ORDER BY` requires you to explicitly specify the type of the expression if type cannot be determined automatically.

Automatic type detection works in the following cases:

* the expression is interpreted as a number if
	* the result of the expression is the result of the arithmetic operation
	* the result of the expression is the value returned from one of the standard functions, which explicitly specified the numeric type of the return value, e.g.: `FLOOR()`, `ROUND()`, `CEIL()`
* the expression is interpreted as a string if
	* the result of the expression is the value returned from one of the standard functions, which explicitly specified the string type return value, for example: `CONCAT()`

#### Strict equal

The comparison operator `=` works on the same rules as the `==` operator in JavaScript, if you want to compare the value on strict compliance with the type and value, then you should use the strict comparison operator - `===`.

#### Operator `IN` and `STRICT IN`

The operator `IN` uses the operator `=`, so the expression `"10" IN (10)` will be true while the operator is `STRICT IN` uses within the operator `===` so `"10" STRICT IN (10)` is false.

#### `null` and `undefined`

When processing are some differences between fields with a value of `null` and missing fields, for example when the query is executed

```sql
SELECT value
```

of specified rows

```
{"id": 1, "value": 1}
{"id": 2, "value": null}
{"id": 3}
```

output will be

```
{"value": 1}
{"value": null}
{}
```

`null` does not imply any special treatment, while the appeal to non-existent field (`undefined`) will not create the appropriate field in the result row.

### Dates

All functions and operators work with dates, in addition to `FROM_UNIXTIME()` can only operate on objects of class [Date](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date) and rows in the format understood by the constructor of [Date](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date). To work with the unix timestamp, you need to explicitly convert the unix timestamp into the date function `FROM_UNIXTIME(unixTimestamp)`.

#### Time Zone

Manipulation of dates are produced for the local time zone. At the moment the only possibility to change this behavior is to change the environment variable `TZ` before running NodeJS. For example
```
% TZ=UTC node main.js ...
```

#### Functions

* `FROM_UNIXTIME(unixTimestamp)` - convert unix timestamp to Date
* `UNIX_TIMESTAMP([dateString])` - to convert the current time or the time passed in `dateString` into a unix timestamp
* `DATE([dateString])` - get the current date in the format `YYYY-MM-DD`. If passed an optional argument `dateString` the date is calculated from the given string, not from the current time
* `NOW()` - get current Date

#### Operators and keywords

For working with dates you can use operators. For example, you can add 1 day and 2 hours to the current time:

```sql
SELECT NOW() + INTERVAL 1 DAY 2 HOUR
```

substract 1 day and 2 hours:
```sql
SELECT NOW() - INTERVAL 1 DAY 2 HOUR
```

Full list of supported units

* `YEAR`
* `MONTH`
* `DAY`
* `HOUR`
* `MINUTE`
* `SECOND`

Operations can be combined

```sql
SELECT NOW() + INTERVAL 1 YEAR 1 MONTH - INTERVAL 1 DAY
```

### Bindings

Binding allow you to safely insert any constant in SQL query, for example

```sql
SELECT * WHERE field = :field
```
where `field` is a "slot" whose value must be set using the [`Select.prototype.bind()`](#selectprototypebindident-value).

You can bind not only data but also the field names. In this case the name of binding need to be wrapped into square brackets

```sql
SELECT * WHERE {:field} = :value
```

Binding are of two types:
* binding a single value, form: `:bind` (single `:` character before name)
* binding list of values form: `::bind` (`::` before name)

#### Single-value binding
You can use a binding one value in the SQL for the argument of the function for the operand in the binary and unary operators, and generally in all cases where SQL is meant for a single expression

```sql
SELECT * WHERE id = :id
// for :id = 1 - SELECT * WHERE id = 1

SELECT * WHERE value > FLOOR(:id)
// for :id = 1 - SELECT * WHERE value > FLOOR(1)

SELECT id, amount * :price AS revenue WHERE value > amount * :price

SELECT * WHERE {:field} = :value
// to filter a field with the name taken from the value of binding :field
```

#### Multi-value binding

This kind of binding more complex and allows you to replace not single operands and expressions, but lists. For example, using such binding you can substitute several of the function arguments

```sql
SELECT * WHERE id IN(::ids)
// for ::ids = [1, 2, 3] - SELECT * WHERE id IN(1, 2, 3)

SELECT IF(enabled, ::trueFalse)
// for ::ids = ['true', 'false'] - SELECT IF(enabled, 'true', 'false')

SELECT * WHERE {::fieldPath} IN(::values)
// field path will be in ::fieldPath, for example
// if ::fieldPath = ['key', 'subkey'], then query be
// SELECT * WHERE key.subkey IN(::values)

SELECT * WHERE {:name1}.{:name2}.{::tail} IN(::values)
// path will be concatenation of :name1, :name2 and elements of ::tail
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

In order to execute the query, you need

1. create an instance JlSqlApi with the necessary options: `const jlSqlApi = new JlSqlApi({});`
2. create a request object from SQL: `const query = jlSqlApi.query('SELECT SUM(price)');`
3. to set the data sources by methods `from*()` and `add*()` (a set of methods `add*()` is optional and is only required for queries with JOIN)
4. set a destination and format of the result by calling one of the methods `to*()`

### `options` object

* `tmpDir` - the default path to the directory to store temporary files used for sorting and JOIN's. This value can be overwritten by specific values of `tmpDir` in the appropriate options object
* `forceInMemory` - enable a mode in which all data manipulations occur only in the process memory, the FS and third-party programs (such as `sort`) are not used. Default is `false`
* `dataSourceResolvers` - array by the data sources resolvers described in section [Dynamic data source binding](#dynamic-data-source-binding)
* `sortOptions`
	* `inMemoryBufferSize` - maximum number of __objects__, which can be sorted in memory. Upon exhaustion of this limit the external utility sorting using `sort` will be used. Default: 16000
	* `bufferSize` - the buffer size of external sort (utility `sort` option `-S`) in __bytes__. Default: 64MB
	* `tmpDir` - path to the directory to store temporary files used for sorting (utility `sort`). If not specified, this defaults to `tmpDir` from root object options, if not specified it you can look default at `man sort` in the description of option `-T`
	* `forceInMemory` - do not use unix `sort` for sorting. All manipulations will be made in the memory of the process. Overrides the value `forceInMemory` from root options. When this option is enabled then option `tmpDir`, `bufferSize`, `inMemoryBufferSize` will be ignored
* `joinOptions`
	* `maxKeysInMemory` - maximum __number__ of keys in the JOIN buffer in memory, exceeding this value are used temporary files in the directory `tmpDir`
	* `tmpDir` - the directory in which temporary files are placed. If not specified, defaults to the root object `options`, if not specified then `os.tmpdir()`
	* `forceInMemory` - do not use FS to store temporary data. All manipulations will be made in the memory of the process. Overrides the value of `forceInMemory` from root options. When this option is enabled then `maxKeysInMemory`, `tmpDir` will be ignored

#### Example

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

### Data Formats

As you can see, methods for choice of source and receiver data have similar names, formed according to the rule `{from|add to the}{JsonStream|ObjectsStream|ArrayOfObjects}`. The first part means, respectively, the source, additional source and receiver and the second data format on the input or output, e.g. `fromJsonStream()`.

* `JsonStream` - `stream.Readable` of bytes/text that is presented in the form of objects, encoded in JSON and separated from each other by newline (`\n` === `0x0A`). The `'\n'` characters within object JSON is not allowed: one object must take strictly one line. An example of such data can be viewed in the "Examples" section
* `ObjectsStream` - `stream.Readable` with the option `{objectMode: true}`, which operates on stream of objects
* `ArrayOfObjects` - means that the data need to transmit or receive in the form of a regular array of objects, streams are not used here

### `Select.prototype.bind(ident, value)`

Bind values (see [Bindings](#bindings)).

* `ident` - binding name including `:` (single-value binding) or `::` (multi-value binding)
* `value` - value. Must be scalar for single-value bindings or array for multi-value bindings

This method returns `this`, so you can use the chain notation.

### `Select.prototype.fromJsonStream([stream])`
### `Select.prototype.fromObjectsStream([stream])`
### `Select.prototype.fromArrayOfObjects(array)`

Bind primary data source to the query, this source is used as the `FROM` for the SQL query. The source can be a stream (methods `fromJsonStream()`, `fromObjectStream ()`) and an array of objects (method `fromArrayOfObjects()`).

If the streaming method does not supply the optional argument `stream`, it will be assumed that data will be written in a stream that will return one of the methods `to*()` by NodeJS streams methods: `write()` and `pipe()`.

All these methods return an instance of class `SelectFrom`.

### `SelectFrom.prototype.addJsonStream(location, readableStream)`
### `SelectFrom.prototype.addObjectsStream(location, readableStream)`
### `SelectFrom.prototype.addArrayOfObjects(location, array)`

Bind additional data source to that can be used to `JOIN` in the query.

`location` - an array of strings or a string representing the name of the table for which the source can be referenced from a query `SELECT ... JOIN <name>`. The name may be layered, for example a `user`.`payments`: `location` you need to specify the array['user', 'payment']`. For one-level names are allowed to be passed as an array with one element or just a string

Example

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

You should pay attention to the line `@payments.userId`: each data source must have unique names, the source names always begin with the `@` symbol and must not be wrapped in back quotes (`` ` ``). The sources added via the `add*()` by default, given the names on the last element `location`, so in this case we refer to a table as `@payment`.

If we connected the sources with names in the `user.payment` and `company.payment` we get a collision of names. In this case, you need to explicitly specify the alias for one of the sources: `INNER JOIN company.payment AS @companyPayment`.

The API provides the possibility of resolving dynamic source names, so it is not necessary to explicitly write each of them. More information can be found in the section [Dynamic data source binding](#dynamic-data-source-binding).

### `SelectFrom.prototype.toJsonStream([stream])`
### `SelectFrom.prototype.toObjectsStream([stream])`
### `SelectFrom.prototype.toArrayOfObjects(callback(array))`

Using this set of methods, you can specify the format and the data receiver, it is identical to set `from*()`, except that in method `toArrayOfObjects()` need to pass a handler with one argument - an array of output objects.

If the parameter `stream` is not specified, then the data can be accessed through standard mechanism `stream.Readable`: `.on('data', ...)`, `.on('readable', ...)`, `.pipe(destination)`, etc.


### Dynamic data source binding

Often a situation arises where we cannot add additional data sources through the methods `add*()`. For example, when a SQL query is entered by the user who wants to work with files in filesystem.

To solve this problem in an object `options` has the `dataSourceResolvers`, in which you can pass an array of resolvers.

Resolver must extends class `require('jl-sql-api').DataSourceResolver` and implement at least the method `resolve()`. Not necessarily, but preferably, also implement method `extractAlias()`.

#### `resolve(location)`

Is used to create a `stream.Readable` by the name "tables" of SQL. If the request contains this code `INNER JOIN user.payment ... INNER JOIN transaction`, then this method will be called twice: once for the table `user.payment` with argument `["user", "payment"]` and once for `transaction` with argument `["transaction"]`.

Method can return either `stream.Readable` or `null` if the source to determine it did not. All resolvers in the array will be called in the order while some do not return non-`null`. If all returned `null`, then there is a check on sources that have been explicitly added using `add*()`.

#### `extractAlias(location)`

Used to determine the table alias, if not specified by user via `AS`, e.g., `... INNER JOIN user.payment ON ...`.

The method must return a string or `null` if the alias is not defined.

#### Example

This code is used in the utility `jl-sql` to dynamically create a data source based on file path ([DataSourceFileResolver.js](https://github.com/avz/jl-sql/blob/master/src/DataSourceFileResolver.js))

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
