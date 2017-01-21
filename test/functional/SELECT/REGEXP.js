'use strict';

const JlSql = require('../../..');
const assert = require('assert');

describe('SELECT', () => {
	const jlSql = new JlSql({forceInMemory: true});

	describe('LIKE', () => {
		const test = (name, string, regexp, result) => {
			it(name, (done) => {
				jlSql.query('SELECT ' + JSON.stringify(string) + ' REGEXP ' + JSON.stringify(regexp) + ' AS t')
					.fromArrayOfObjects([{}])
					.toArrayOfObjects((r) => {
						assert.strictEqual(r[0].t, result);
						done();
					})
				;
			});
		};

		test('case sensitivity', 'world', '/woRld/', false);
		test('case insensitivity', 'world', '/woRld/i', true);
		test('unicode case sensitivity', 'приВет', '/привет/', false);
		test('unicode case insensitivity', 'приВет', '/привет/i', true);
		test('escaping', 'wor/ld', '/wor\\/ld/', true);
		test('escaping 2', 'wor\\\\/ld', '/wor\\\\\\\\\\/ld/', true);
		test('multiline and /./', 'hello\nworld', '/hello.*world/', false);
		test('multiline and /[\\s\\S]/', 'hello\nworld', '/hello[\\s\\S]*world/', true);

		it('operator precedence', (done) => {
			jlSql.query('SELECT 1 + "hi" REGEXP "/hi/" + 2 AS t')
				.fromArrayOfObjects([{}])
				.toArrayOfObjects((r) => {
					assert.strictEqual(r[0].t, 4);
					done();
				})
			;
		});

		it('NOT #1', (done) => {
			jlSql.query('SELECT "hi" NOT REGEXP "/hi/" AS t')
				.fromArrayOfObjects([{}])
				.toArrayOfObjects((r) => {
					assert.strictEqual(r[0].t, false);
					done();
				})
			;
		});

		it('NOT #2', (done) => {
			jlSql.query('SELECT "hi" NOT REGEXP "/hiy/" AS t')
				.fromArrayOfObjects([{}])
				.toArrayOfObjects((r) => {
					assert.strictEqual(r[0].t, true);
					done();
				})
			;
		});

		it('dynamic regexps', (done) => {
			jlSql.query('SELECT "hi" REGEXP CONCAT("/", "hi", "/") AS t')
				.fromArrayOfObjects([{}])
				.toArrayOfObjects((r) => {
					assert.strictEqual(r[0].t, true);
					done();
				})
			;
		});
	});
});
