'use strict';

const JlSql = require('../../..');
const assert = require('assert');

describe('SELECT', () => {
	const jlSql = new JlSql({forceInMemory: true});

	describe('LIKE', () => {
		const input = [{
			a: "multi\nline",
			b: "aaa?bbb",
			c: "aaa?bbb",
			d: "abc",
			e: "ABC",
			f: "ABC"
		}];

		let output;

		before(done => {
			jlSql.query('SELECT a LIKE "%line" AS ra, b LIKE "aaa\\%bbb" AS rb, c LIKE "aaa\\_bbb" AS rc, d LIKE "a_c" AS rd, e LIKE "abc" AS re, e ILIKE "abc" AS rf')
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					output = r;
					done();
				})
			;
		});

		it('multiline', () => {
			assert.strictEqual(output[0].ra, true);
		});

		it('escaped %', () => {
			assert.strictEqual(output[0].rb, false);
		});

		it('escaped _', () => {
			assert.strictEqual(output[0].rc, false);
		});

		it('non escaped _', () => {
			assert.strictEqual(output[0].rd, true);
		});

		it('case sensitivity', () => {
			assert.strictEqual(output[0].re, false);
		});

		it('case insensitivity', () => {
			assert.strictEqual(output[0].rf, true);
		});
	});
});
