'use strict';

const JlSql = require('../..');
const assert = require('assert');

describe('INSERT', () => {
	const jlSql = new JlSql;

	it('Empty input', (done) => {
		const input = [];

		jlSql.query(
				'INSERT {"hello": "world"}'
			)
			.fromArrayOfObjects(input)
			.toArrayOfObjects((r) => {
				assert.deepEqual(r, [{hello: 'world'}]);
				done();
			})
		;
	});

	it('One row', (done) => {
		const input = [{r: true}, {r: false}];

		jlSql.query(
				'INSERT {"hello": "world"}'
			)
			.fromArrayOfObjects(input)
			.toArrayOfObjects((r) => {
				assert.deepEqual(r, [{r: true}, {r: false}, {hello: 'world'}]);
				done();
			})
		;
	});

	it('Multiple rows', (done) => {
		const input = [{r: true}, {r: false}];

		jlSql.query(
				'INSERT {"hello": "world"}, {"world": "hello"}'
			)
			.fromArrayOfObjects(input)
			.toArrayOfObjects((r) => {
				assert.deepEqual(r, [{r: true}, {r: false}, {hello: 'world'}, {world: 'hello'}]);
				done();
			})
		;
	});
});
