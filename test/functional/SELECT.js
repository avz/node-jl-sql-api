const JlSql = require('../..');
const assert = require('assert');

describe('SELECT', () => {
	run = (jlSql) => {
		describe('`SELECT * WHERE ...`', () => {
			const input = [{hello: "world"}, {hello: "hello"}];

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

		describe('`SELECT [field[, ...]]`', () => {
			const input = [{f1: "11", f2: "12", f3: "13"}];

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
				assert.deepEqual(
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
				assert.deepEqual(
					output,
					[
						{a: 1, b: 3},
						{a: '1', b: 5},
						{a: 2, b: 2},
						{a: 3, b: 4},
						{a: 3, b: 6},
						{a: 10, b: 6},
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
				{a: null,b: 8}
			];

			let output;

			before(done => {
				jlSql.query('SELECT a, COUNT(*) AS count GROUP BY a')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						output = r;
						done();
					})
				;
			});

			it('aggregated and ordered', () => {
				assert.deepEqual(
					output,
					[
						{count: 1},
						{a: 1, count: 2},
						{a: 2, count: 1},
						{a: 3, count: 2},
						{a: null, count: 1}
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
				assert.deepEqual(
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
						assert.deepEqual(r, [{k: 3}, {k: 2}, {k: 1}])
						done();
					})
				;
			});

			it('DESC', done => {
				jlSql.query('SELECT k GROUP BY k ORDER BY SUM(k) DESC')
					.fromArrayOfObjects(input)
					.toArrayOfObjects((r) => {
						assert.deepEqual(r, [{k: 1}, {k: 2}, {k: 3}])
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
							undef AS deepUndef.undef`
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

			it('alias to alias', () => {
				assert.strictEqual(output[0].nonexistentAlias, undefined);
			})

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

			it('alias to undefined does not make empty deep object', () => {
				assert.strictEqual(output[0].deepUndef, undefined);
			})
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

			const doTests = (maxKeysInMemory, dataSet, resultsField, sql) => {
				const jlSqlModified = new JlSql(JSON.parse(JSON.stringify(jlSql.options)));
				jlSqlModified.options.joinOptions.maxKeysInMemory = maxKeysInMemory;

				for (const dsi in dataSets) {
					const ds = dataSets[dsi]

					describe('dataset #' + (parseInt(dsi) + 1), () => {
						let output;

						before(done => {
							jlSqlModified.query(
									sql
								)
								.fromArrayOfObjects(ds.host)
								.addArrayOfObjectsStream('child', ds.child)
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
					describe('INNER JOIN', () => {
						doTests(
							maxKeysInMemory,
							dataSets,
							'innerResult',
							'SELECT hostSomeProp, hostKeyProp, @child.keyProp, @child.someProp INNER JOIN `child` AS @child ON @child.keyProp = hostKeyProp'
						)
					});

					describe('LEFT JOIN', () => {
						doTests(
							maxKeysInMemory,
							dataSets,
							'leftResult',
							'SELECT hostSomeProp, hostKeyProp, @child.keyProp, @child.someProp LEFT JOIN `child` AS @child ON @child.keyProp = hostKeyProp'
						)
					});
				});
			}
		});
	};

	describe('in-memory sort', () => {
		run(new JlSql);
	});

	describe('external sort (unix `sort` cmd)', () => {
		run(new JlSql({externalSort: true}));
	});
});
