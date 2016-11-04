## Examples

Common code

```javascript
const JlSqlApi = require('jl-sql-api');

const api = new JlSqlApi;
```

### From JSON stream (e.g, stdin) to JSON stream (e.g. stdout)

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

### From array to stream

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
