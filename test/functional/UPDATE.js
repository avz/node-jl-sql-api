'use strict';

const JlSql = require('../..');
const assert = require('assert');

describe('UPDATE', () => {
	const jlSql = new JlSql;

	it('Without WHERE', (done) => {
		const input = [{r: true}, {r: false}];

		jlSql.query(
				'UPDATE SET v = 1'
			)
			.fromArrayOfObjects(input)
			.toArrayOfObjects((r) => {
				assert.deepStrictEqual(r, [{r: true, v: 1}, {r: false, v: 1}]);
				done();
			})
		;
	});

	it('With WHERE', (done) => {
		const input = [{r: true}, {r: false}];

		jlSql.query(
				'UPDATE SET v = 1 WHERE r'
			)
			.fromArrayOfObjects(input)
			.toArrayOfObjects((r) => {
				assert.deepStrictEqual(r, [{r: true, v: 1}, {r: false}]);
				done();
			})
		;
	});

	it('Bindings', (done) => {
		const input = [{r: true}, {r: false}];

		jlSql.query(
				'UPDATE SET v = :bind WHERE r'
			)
			.bind(':bind', 'binded')
			.fromArrayOfObjects(input)
			.toArrayOfObjects((r) => {
				assert.deepStrictEqual(r, [{r: true, v: 'binded'}, {r: false}]);
				done();
			})
		;
	});
});
