'use strict';

const JlSql = require('../../..');
const PassThrough = require('stream').PassThrough;
const assert = require('assert');

describe('SELECT', () => {
	describe('data source calls', () => {
		const test = (query, ctorChecker, done) => {
			const row = {fake: 12};

			const jlSql = new JlSql({
				forceInMemory: true,
				dataFunctions: {
					read: {
						DUAL: {
							ctor: (location, options) => {
								ctorChecker(location, options);

								const s = new PassThrough({objectMode: true});

								s.end([row]);

								return s;
							},
							outputType: 'array_of_rows'
						}
					}
				}
			});

			jlSql.query(query)
				.fromArrayOfObjects([])
				.toArrayOfObjects((r) => {
					assert.deepStrictEqual(r, [row]);
					done();
				})
			;
		};

		it('no args', done => {
			test(
				'SELECT * FROM DUAL()',
				(location, options) => {
					assert.strictEqual(location, null);
					assert.deepStrictEqual(options, {});
				},
				done
			);
		});

		it('only location', done => {
			test(
				'SELECT * FROM DUAL(`a`.`b`)',
				(location, options) => {
					assert.deepStrictEqual(location, ['a', 'b']);
					assert.deepStrictEqual(options, {});
				},
				done
			);
		});

		it('location and options', done => {
			test(
				'SELECT * FROM DUAL(`a`.`b`, {hello: 10})',
				(location, options) => {
					assert.deepStrictEqual(location, ['a', 'b']);
					assert.deepStrictEqual(options, {hello: 10});
				},
				done
			);
		});
	});
});
