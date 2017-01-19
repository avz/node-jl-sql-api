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

	describe('intervals', () => {
		const cases = [
			[
				new Date('2016-12-05 12:34:50'),
				[
					[2, SqlNodes.Interval.UNIT_YEAR],
					[3, SqlNodes.Interval.UNIT_MONTH],
					[4, SqlNodes.Interval.UNIT_DAY],
					[5, SqlNodes.Interval.UNIT_HOUR],
					[6, SqlNodes.Interval.UNIT_MINUTE],
					[7, SqlNodes.Interval.UNIT_SECOND]
				],
				{
					'+': new Date('2019-03-09 17:40:57'),
					'-': new Date('2014-09-01 07:28:43')
				}
			]
		];

		for (const c of cases) {
			const base = c[0];
			const deltas = c[1];

			const inputs = {
				string: base.toISOString(),
				int: base.getTime() / 1000,
				date: base
			};

			const intervalNode = new SqlNodes.Interval;

			for (const delta of deltas) {
				intervalNode.add(new SqlNodes.Number(delta[0]), delta[1]);
			}

			for (const oper in c[2]) {
				const result = c[2][oper];

				for (const type in inputs) {
					const input = inputs[type];

					it('operator ' + oper + ' for ' + type, () => {
						const f = sqlToJs.nodeToFunction(
							new SqlNodes.BinaryArithmeticOperation(
								oper,
								SqlNodes.ColumnIdent.fromComplexIdent(new SqlNodes.ComplexIdent(['@', 'input'])),
								intervalNode
							)
						);

						assert.equal(f({sources: {'@': {input: input}}}).toISOString(), result.toISOString());
					});
				}
			}
		}
	});

	describe('timestamps comparison', () => {
		const makeDeltaNode = (baseNode, deltaSeconds) => {
			const interval = new SqlNodes.Interval;

			interval.add(new SqlNodes.Number(deltaSeconds), SqlNodes.Interval.UNIT_SECOND);

			return new SqlNodes.IntervalOperation(
				'+',
				baseNode,
				interval
			);
		};

		const makeCase = (operator, baseNode, deltaSeconds) => {
			return new SqlNodes.ComparisonOperation(
				operator,
				baseNode,
				makeDeltaNode(baseNode, deltaSeconds)
			);
		};

		const baseNodes = {
			'unix timestamp': new SqlNodes.Number(1484834780)
		};

		for (const baseNodeName in baseNodes) {
			const baseNode = baseNodes[baseNodeName];

			const cases = {
				'=': [
					makeCase('=', baseNode, 0),
					true
				],
				'===': [
					makeCase('===', baseNode, 0),
					true
				],
				'>': [
					makeCase('>', baseNode, 0),
					false
				],
				'<': [
					makeCase('<', baseNode, 0),
					false
				],
				'>=': [
					makeCase('>=', baseNode, 0),
					true
				],

				'<=': [
					makeCase('<=', baseNode, 0),
					true
				],
				'shifted+ =': [
					makeCase('=', baseNode, 1),
					false
				],
				'shifted+ ===': [
					makeCase('===', baseNode, 1),
					false
				],
				'shifted+ >': [
					makeCase('>', baseNode, 1),
					false
				],
				'shifted+ <': [
					makeCase('<', baseNode, 1),
					true
				],
				'shifted+ >=': [
					makeCase('>=', baseNode, 1),
					false
				],
				'shifted+ <=': [
					makeCase('<=', baseNode, 1),
					true
				],
				'shifted- =': [
					makeCase('=', baseNode, -1),
					false
				],
				'shifted- ===': [
					makeCase('===', baseNode, -1),
					false
				],
				'shifted- >': [
					makeCase('>', baseNode, -1),
					true
				],
				'shifted- <': [
					makeCase('<', baseNode, -1),
					false
				],
				'shifted- >=': [
					makeCase('>=', baseNode, -1),
					true
				],
				'shifted- <=': [
					makeCase('<=', baseNode, -1),
					false
				]
			};

			describe(baseNodeName, () => {
				for (const cn in cases) {
					const c = cases[cn];

					it(cn, () => {
						const f = sqlToJs.nodeToFunction(c[0]);

						assert.equal(f({sources: {'@': {}}}), c[1]);
					});
				}
			});
		}
	});
});
