'use strict';

const JlSql = require('../../..');
const assert = require('assert');

describe('SELECT', () => {
	const jlSql = new JlSql({forceInMemory: true});

	describe('`SELECT ... AS alias[.deepAlias[. ...]]`', () => {
		const input = [{a: 10}];

		let output;

		before(done => {
			jlSql.query(
					`SELECT
						a,
						a AS aliasForA,
						aliasForA AS nonexistentAlias,
						a + 10 AS b,
						a + 20 AS deep.c,
						a + 30 AS deep.d.e,
						'hel\\'lo' AS \`wo\\\`rld\`,
						undef AS deepUndef.undef,
						a + 40`
				)
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					output = r;
					done();
				})
			;
		});

		it('original column', () => {
			assert.strictEqual(output[0].a, input[0].a);
		});

		it('escaping', () => {
			assert.strictEqual(output[0]["wo`rld"], "hel'lo");
		});

		it('alias to alias', () => {
			assert.strictEqual(output[0].nonexistentAlias, undefined);
		});

		it('direct column to alias mapping', () => {
			assert.strictEqual(output[0].aliasForA, input[0].a);
		});

		it('aliases to top level', () => {
			assert.strictEqual(output[0].b, input[0].a + 10);
		});

		it('aliases to deep levels', () => {
			assert.strictEqual(output[0].deep.c, input[0].a + 20);
			assert.strictEqual(output[0].deep.d.e, input[0].a + 30);
		});

		it('alias to undefined make empty deep object', () => {
			assert.deepEqual(output[0].deepUndef, {});
		});

		it('auto-generated alias', () => {
			assert.strictEqual(output[0]['a + 40'], input[0].a + 40);
		});
	});

	describe('aliases accessibility', () => {
		it('WHERE', done => {
			const input = [{a: 1}, {a: 2}];

			jlSql.query('SELECT a AS b WHERE b = 1 AND a = 1')
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					assert.deepStrictEqual(r, [{b: 1}]);
					done();
				})
			;
		});

		it('GROUP BY', done => {
			const input = [{a: 1}, {a: 2}];

			jlSql.query('SELECT a AS b, COUNT(*) AS c GROUP BY b')
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					assert.deepStrictEqual(r, [{b: 1, c: 1}, {b: 2, c: 1}]);
					done();
				})
			;
		});

		it('HAVING', done => {
			const input = [{a: 1}, {a: 2}];

			jlSql.query('SELECT a AS b HAVING b = 1')
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					assert.deepStrictEqual(r, [{b: 1}]);
					done();
				})
			;
		});
	});
});
