const JlSql = require('../..');
const assert = require('assert');

const jlSql = new JlSql;

describe('SELECT', () => {
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
			{a: 1, b: 3},
			{a: 3, b: 6},
			{a: 3, b: 4},
			{a: 1, b: 5}
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
					{a: 1, b: 3},
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
});
