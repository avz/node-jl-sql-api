'use strict';

const JlSql = require('../..');
const assert = require('assert');

describe('DELETE', () => {
	const jlSql = new JlSql;

	it('Without WHERE', (done) => {
		const input = [{r: true}, {r: false}];

		jlSql.query(
				'DELETE'
			)
			.fromArrayOfObjects(input)
			.toArrayOfObjects((r) => {
				assert.deepEqual(r, []);
				done();
			})
		;
	});

	it('With WHERE', (done) => {
		const input = [{r: true}, {r: false}];

		jlSql.query(
				'DELETE WHERE r'
			)
			.fromArrayOfObjects(input)
			.toArrayOfObjects((r) => {
				assert.deepEqual(r, [{r: false}]);
				done();
			})
		;
	});
});
