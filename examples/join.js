const JlSqlApi = require('jl-sql-api');

const api = new JlSqlApi({forceInMemory: true});

api.query('SELECT id AS mid, @child.field INNER JOIN child ON @child.mainId = id')
	.fromArrayOfObjects([
		{"id": 1},
		{"id": 2}
	])
	.addArrayOfObjects('child', [
		{"mainId": 1, "field": 11},
		{"mainId": 1, "field": 12},
		{"mainId": 2, "field": 21},
		{"mainId": 3, "field": 31}
	])
	.toArrayOfObjects((r) => {
		console.log(r);
	})
;

// make runkit.com silent
'Waiting for result...';
