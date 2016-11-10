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

		describe('`SELECT ... GROUP BY [field[, ...]]`', () => {
			const input = [
				{a: 2, b: 2},
				{a: 1, b: 3},
				{a: 3, b: 6},
				{a: 3, b: 4},
				{a: 1, b: 5}
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
						{a: 1, count: 2},
						{a: 2, count: 1},
						{a: 3, count: 2}
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

		describe('`SELECT ... INNER JOIN ...`', () => {
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
					result: [
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: '1', someProp: 203},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: '1', someProp: 203},
						{hostSomeProp: 104, hostKeyProp: 3, keyProp: 3, someProp: 204}
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
						{someProp: 202, keyProp: 1},
						{someProp: 203, keyProp: '1'},
						{someProp: 204, keyProp: 3}
					],
					result: [
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: '1', someProp: 203},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 202},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: '1', someProp: 203},
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
					result: [
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
					result: [
						{hostSomeProp: 101, hostKeyProp: 1, keyProp: 1, someProp: 201},
						{hostSomeProp: 102, hostKeyProp: 1, keyProp: 1, someProp: 201},
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
					result: [
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
					result: [
					]
				}
			]

			for (const dsi in dataSets) {
				const ds = dataSets[dsi]

				describe('dataset #' + (parseInt(dsi) + 1), () => {
					let output;

					before(done => {
						jlSql.query(
								'SELECT hostSomeProp, hostKeyProp, @child.keyProp, @child.someProp INNER JOIN @child ON @child.keyProp = hostKeyProp'
							)
							.fromArrayOfObjects(ds.host)
							.addArrayOfObjectsStream('@child', ds.child)
							.toArrayOfObjects((r) => {
								output = r;
								done();
							})
						;
					});

					it('valid result', () => {
						assert.deepEqual(output, ds.result);
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
