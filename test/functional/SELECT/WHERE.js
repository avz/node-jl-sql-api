'use strict';

const JlSql = require('../../..');
const assert = require('assert');

describe('SELECT', () => {
	const jlSql = new JlSql({forceInMemory: true});

	describe('`SELECT * WHERE ...`', () => {
		const input = [{hello: 'world'}, {hello: 'hello'}];

		let output;

		before(done => {
			jlSql.query('SELECT * WHERE hello = "hello"')
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					output = r;
					done();
				})
			;
		});

		it('filters', () => {
			assert.strictEqual(output.length, 1);
			assert.strictEqual(output[0].hello, 'hello');
		});

		it('return same objects', () => {
			assert.strictEqual(output[0], input[1]);
		});
	});
});
