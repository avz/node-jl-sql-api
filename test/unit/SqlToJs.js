'use strict';

const assert = require('assert');
const SqlToJs = require('../../src/SqlToJs');
const RuntimeContext = require('../../src/RuntimeContext');
const FunctionsMap = require('../../src/FunctionsMap');
const SqlNodes = require('../../src/sql/Nodes');

describe('SqlToJs', () => {
	const sqlToJs = new SqlToJs(new FunctionsMap, new RuntimeContext(new FunctionsMap));

	describe('operators', () => {
		describe('`+`', () => {
			const node = new SqlNodes.BinaryArithmeticOperation(
				'+',
				new SqlNodes.ColumnIdent(['@', 'a']),
				new SqlNodes.ColumnIdent(['@', 'b'])
			);

			const generatedFunction = sqlToJs.nodeToFunction(node);
			const plus = (a, b) => {
				return generatedFunction({sources: {'@': {a: a, b: b}}});
			};

			it('number and number', () => {
				assert.strictEqual(plus(1, 150), 151);
			});

			it('string and number', () => {
				assert.strictEqual(plus(1, '150'), 151);
				assert.strictEqual(plus('150', 1), 151);
			});

			it('string and string', () => {
				assert.strictEqual(plus('1', '150'), 151);
			});

			it('invalid string', () => {
				assert.ok(isNaN(plus('1', '150hello')));
			});
		});
	});

	describe('IN()', () => {
		const testIn = (testValue, ctor = SqlNodes.UnstrictIn) => {
			let node;

			if (typeof(testValue) === 'number') {
				node = new SqlNodes.Number(testValue);
				node.value = testValue;
			} else if (typeof(testValue) === 'string') {
				node = new SqlNodes.String('""');
				node.value = testValue;
			} else {
				node = testValue;
			}

			return sqlToJs.nodeToFunction(new ctor(
				node,
				new SqlNodes.ExpressionsList([
					new SqlNodes.String('"11"'),
					new SqlNodes.Number(10),
					new SqlNodes.Number(9)
				])
			))(testValue);
		};

		const strictTestIn = (testValue) => {
			return testIn(testValue, SqlNodes.StrictIn);
		};

		it('unstrict', () => {
			assert.strictEqual(testIn(11), true);
			assert.strictEqual(testIn('11'), true);
			assert.strictEqual(testIn(9), true);
			assert.strictEqual(testIn('9'), true);
			assert.strictEqual(testIn(10), true);
			assert.strictEqual(testIn('10'), true);
			assert.strictEqual(testIn(8), false);
			assert.strictEqual(testIn('8'), false);
		});

		it('strict', () => {
			assert.strictEqual(strictTestIn(11), false);
			assert.strictEqual(strictTestIn('11'), true);
			assert.strictEqual(strictTestIn(9), true);
			assert.strictEqual(strictTestIn('9'), false);
			assert.strictEqual(strictTestIn(10), true);
			assert.strictEqual(strictTestIn('10'), false);
			assert.strictEqual(strictTestIn(8), false);
			assert.strictEqual(strictTestIn('8'), false);
		});
	});
});
