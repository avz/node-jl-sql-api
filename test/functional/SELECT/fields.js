'use strict';

const JlSql = require('../../..');
const assert = require('assert');

describe('SELECT', () => {
	const jlSql = new JlSql({forceInMemory: true});

	describe('`SELECT *, ...`', () => {
		const input = [{hello: 'world'}, {hello: 'hello'}];

		let output;

		before(done => {
			jlSql.query('SELECT *, hello AS helloAlias')
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					output = r;
					done();
				})
			;
		});

		it('return new objects', () => {
			assert.notStrictEqual(output[0], input[0]);
			assert.notStrictEqual(output[1], input[1]);
		});

		it('merged row', () => {
			assert.deepStrictEqual(output[0], {hello: 'world', helloAlias: 'world'});
			assert.deepStrictEqual(output[1], {hello: 'hello', helloAlias: 'hello'});
		});
	});

	describe('`SELECT [field[, ...]]`', () => {
		const input = [{f1: '11', f2: '12', f3: '13'}];

		let output;

		before(done => {
			jlSql.query('SELECT f1, f2')
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					output = r;
					done();
				})
			;
		});

		it('returns new objects', () => {
			assert.notDeepStrictEqual(output[0], input[0]);
		});

		it('make right properties', () => {
			assert.strictEqual(output[0].f1, '11');
			assert.strictEqual(output[0].f2, '12');
			assert.strictEqual(output[0].f3, undefined);
		});

		it('original objects was not updated', () => {
			assert.strictEqual(input[0].f1, '11');
			assert.strictEqual(input[0].f2, '12');
			assert.strictEqual(input[0].f3, '13');
		});
	});
});
