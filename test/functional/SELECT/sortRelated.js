'use strict';

const JlSql = require('../../..');
const assert = require('assert');

describe('SELECT', () => {
	const run = (jlSql) => {
		describe('`SELECT DISTINCT ...`', () => {
			const input = [{a: 1, b: 2}, {a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 2}];

			let output;

			before(done => {
				jlSql.query('SELECT DISTINCT a, b')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						output = r;
						done();
					})
				;
			});

			it('unique', () => {
				assert.deepStrictEqual(output, [{a: 1, b: 2}, {a: 1, b: 3}, {a: 2, b: 2}]);
			});
		});

		describe('`SELECT COUNT(DISTINCT ...)`', () => {
			const input = [{a: 1, b: 2}, {a: null, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {b: 3}];

			let output;

			before(done => {
				jlSql.query('SELECT COUNT(DISTINCT a) AS c')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						output = r;
						done();
					})
				;
			});

			it('right count', () => {
				assert.deepStrictEqual(output, [{c: 2}]);
			});
		});

		describe('`SELECT ... ORDER BY [field[, ...]]`', () => {
			const input = [
				{a: 2, b: 2},
				{a: '1', b: 3},
				{a: 3, b: 6},
				{a: 3, b: 4},
				{a: 1, b: 5},
				{a: 10, b: 6}
			];

			let output;

			before(done => {
				jlSql.query('SELECT * ORDER BY a, b DESC')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						output = r;
						done();
					})
				;
			});

			it('ordered', () => {
				assert.deepStrictEqual(
					output,
					[
						{a: 1, b: 5},
						{a: '1', b: 3},
						{a: 10, b: 6},
						{a: 2, b: 2},
						{a: 3, b: 6},
						{a: 3, b: 4}
					]
				);
			});
		});

		describe('`SELECT ... ORDER BY NUMBER(...)`', () => {
			const input = [
				{a: 2, b: 2},
				{a: '1', b: 3},
				{a: 3, b: 6},
				{a: 3, b: 4},
				{a: 1, b: 5},
				{a: 10, b: 6}
			];

			let output;

			before(done => {
				jlSql.query('SELECT * ORDER BY NUMBER(a), b')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						output = r;
						done();
					})
				;
			});

			it('ordered', () => {
				assert.deepStrictEqual(
					output,
					[
						{a: '1', b: 3},
						{a: 1, b: 5},
						{a: 2, b: 2},
						{a: 3, b: 4},
						{a: 3, b: 6},
						{a: 10, b: 6}
					]
				);
			});
		});

		describe('`SELECT ... GROUP BY [field[, ...]]`', () => {
			const input = [
				{a: 2, b: 2},
				{a: 1, b: 3},
				{a: 3, b: 6},
				{a: 3, b: 4},
				{a: 1, b: 5},
				{b: 7},
				{a: null, b: 8}
			];

			let output;

			before(done => {
				jlSql.query('SELECT a, COUNT(*) AS count, COUNT(a) AS countA GROUP BY a')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						output = r;
						done();
					})
				;
			});

			it('aggregated and ordered', () => {
				assert.deepStrictEqual(
					output,
					[
						{count: 1, countA: 0},
						{a: 1, count: 2, countA: 2},
						{a: 2, count: 1, countA: 1},
						{a: 3, count: 2, countA: 2},
						{a: null, count: 1, countA: 0}
					]
				);
			});
		});

		describe('`SELECT ... GROUP BY ... HAVING ...`', () => {
			const input = [
				{a: 2, b: 2},
				{a: 1, b: 3},
				{a: 3, b: 6},
				{a: 3, b: 4},
				{a: 1, b: 5}
			];

			let output;

			before(done => {
				jlSql.query('SELECT a, COUNT(*) AS count GROUP BY a HAVING count > 1')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						output = r;
						done();
					})
				;
			});

			it('make right result', () => {
				assert.deepStrictEqual(
					output,
					[
						{a: 1, count: 2},
						{a: 3, count: 2}
					]
				);
			});
		});

		describe('`SELECT ... GROUP BY ... ORDER BY SUM(...)`', () => {
			const input = [
				{k: 1},
				{k: 1},
				{k: 1},
				{k: 1},
				{k: 1},

				{k: 2},
				{k: 2},

				{k: 3},
			];

			it('ASC', done => {
				jlSql.query('SELECT k GROUP BY k ORDER BY SUM(k)')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						assert.deepStrictEqual(r, [{k: 3}, {k: 2}, {k: 1}]);
						done();
					})
				;
			});

			it('DESC', done => {
				jlSql.query('SELECT k GROUP BY k ORDER BY SUM(k) DESC')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						assert.deepStrictEqual(r, [{k: 1}, {k: 2}, {k: 3}]);
						done();
					})
				;
			});
		});

		it('`SELECT ... ORDER BY SUM(...)`', (done) => {
			const input = [
				{k: 1},
				{k: 1},

				{k: 2},
				{k: 2},
			];

			jlSql.query('SELECT k ORDER BY SUM(k)')
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					assert.strictEqual(r.length, 1);
					done();
				})
			;
		});

		describe('`SELECT ... XXX JOIN ...`', () => {
			const dataSets = [
				{
					host: [
						{hostSomeProp: 101, hostKeyProp: 1},
						{hostSomeProp: 102, hostKeyProp: 1},
						{hostSomeProp: 103, hostKeyProp: 2},
						{hostSomeProp: 104, hostKeyProp: 3}
					],
					child: [
						{someProp: 201, keyProp: 1},
						{someProp: 202, keyProp: 1},
						{someProp: 203, keyProp: '1'},
						{someProp: 204, keyProp: 3}
					],
					innerResult: [
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: '1', someProp: 203},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: '1', someProp: 203},
						{hostSomeProp: 104, hostKeyProp: 3, keyProp: 3, someProp: 204}
					],
					leftResult: [
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: '1', someProp: 203},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: '1', someProp: 203},
						{hostSomeProp: 103, hostKeyProp: 2},
						{hostSomeProp: 104, hostKeyProp: 3, keyProp: 3, someProp: 204}
					]
				},
				{
					host: [
						{hostSomeProp: 101, hostKeyProp: 1},
					],
					child: [
						{someProp: 201, keyProp: 1},
						{someProp: 202, keyProp: 1},
						{someProp: 203, keyProp: '1'},
						{someProp: 204, keyProp: 3}
					],
					innerResult: [
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: '1', someProp: 203},
					],
					leftResult: [
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: '1', someProp: 203},
					]
				},
				{
					host: [
						{hostSomeProp: 101, hostKeyProp: 1},
						{hostSomeProp: 102, hostKeyProp: 1},
						{hostSomeProp: 103, hostKeyProp: 2},
						{hostSomeProp: 104, hostKeyProp: 3}
					],
					child: [
						{someProp: 201, keyProp: 1},
					],
					innerResult: [
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 201},
					],
					leftResult: [
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 103, hostKeyProp: 2},
						{hostSomeProp: 104, hostKeyProp: 3}
					]
				},
				{
					host: [
					],
					child: [
						{someProp: 201, keyProp: 1},
						{someProp: 202, keyProp: 1},
						{someProp: 203, keyProp: '1'},
						{someProp: 204, keyProp: 3}
					],
					innerResult: [
					],
					leftResult: [
					]
				},
				{
					host: [
						{hostSomeProp: 101, hostKeyProp: 1},
						{hostSomeProp: 102, hostKeyProp: 1},
						{hostSomeProp: 103, hostKeyProp: 2},
						{hostSomeProp: 104, hostKeyProp: 3}
					],
					child: [
					],
					innerResult: [
					],
					leftResult: [
						{hostSomeProp: 101, hostKeyProp: 1},
						{hostSomeProp: 102, hostKeyProp: 1},
						{hostSomeProp: 103, hostKeyProp: 2},
						{hostSomeProp: 104, hostKeyProp: 3}
					]
				}
			];

			const doTests = (maxKeysInMemory, dataSets, resultsField, sql) => {
				const jlSqlModified = new JlSql(JSON.parse(JSON.stringify(jlSql.options)));

				jlSqlModified.options.joinOptions.maxKeysInMemory = maxKeysInMemory;

				for (const dsi in dataSets) {
					const ds = dataSets[dsi];

					describe('dataset #' + (parseInt(dsi, 10) + 1), () => {
						let output;

						before(done => {
							jlSqlModified.query(
									sql
								)
								.fromArrayOfObjects(ds.host)
								.addArrayOfObjects('child', ds.child)
								.toArrayOfObjects((r) => {
									output = r;
									done();
								})
							;
						});

						it('valid result', () => {
							assert.deepEqual(output, ds[resultsField]);
						});
					});
				}
			};

			for (const maxKeysInMemory of [1, 3, 16000]) {
				describe('Key buffer size = ' + maxKeysInMemory, () => {
					const joins = [['INNER', 'innerResult'], ['LEFT', 'leftResult']];

					for (const [joinType, resultProp] of joins) {
						const cases = [
							'@child.keyProp = hostKeyProp',
							'hostKeyProp = @child.keyProp',
							'STRING(hostKeyProp) = STRING(@child.keyProp)',
							'NUMBER(hostKeyProp) = NUMBER(@child.keyProp)',
							'hostKeyProp + 0 = @child.keyProp + 0'
						];

						for (const onExpression of cases) {
							describe(`${joinType} JOIN ON ${onExpression}`, () => {
								doTests(
									maxKeysInMemory,
									dataSets,
									resultProp,
									`SELECT hostSomeProp, hostKeyProp, @child.keyProp, @child.someProp ${joinType} JOIN \`child\` AS @child ON ${onExpression}`
								);
							});
						}
					}
				});
			}
		});
	};

	describe('in-memory sort', () => {
		run(new JlSql({sortOptions: {forceInMemory: true}}));
	});

	describe('force external sort (unix `sort` cmd)', () => {
		run(new JlSql({sortOptions: {inMemoryBufferSize: 1}}));
	});
});
