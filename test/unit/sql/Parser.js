'use strict';

const assert = require('assert');
const Parser = require('../../../src/sql/Parser');
const SqlNodes = require('../../../src/sql/Nodes');

describe('SQL Parser', () => {
	const parse = (exp) => {
		return Parser.parse('SELECT * WHERE ' + exp).where;
	};

	describe('JSON', () => {
		describe('scalars', () => {
			const parseScalar = exp => {
				return parse('[' + exp + ']').items[0].value;
			};

			it('string double quoted', () => {
				assert.strictEqual(parseScalar('"str"'), 'str');
			});

			it('string single quoted', () => {
				assert.strictEqual(parseScalar('\'str\''), 'str');
			});

			it('numbers', () => {
				assert.strictEqual(parseScalar('100'), 100);
				assert.strictEqual(parseScalar('100e2'), 100e2);
				assert.strictEqual(parseScalar('100e-2'), 100e-2);
			});

			it('boolean', () => {
				assert.strictEqual(parseScalar('true'), true);
				assert.strictEqual(parseScalar('tRue'), true);
				assert.strictEqual(parseScalar('false'), false);
				assert.strictEqual(parseScalar('faLse'), false);
			});

			it('NULL', () => {
				assert.strictEqual(parseScalar('null'), null);
				assert.strictEqual(parseScalar('nUll'), null);
			});
		});

		describe('objects', () => {
			it('empty', () => {
				assert.deepStrictEqual(parse('{}').map, {});
			});

			it('single key', () => {
				assert.deepStrictEqual(parse('{"hello": "world"}').map['hello'].value, 'world');
			});

			it('multiple keys', () => {
				assert.deepStrictEqual(parse('{"a": "b", "c": "d"}').map['a'].value, 'b');
				assert.deepStrictEqual(parse('{"a": "b", "c": "d"}').map['c'].value, 'd');
			});

			it('without quotes', () => {
				assert.deepStrictEqual(parse('{hello: "world"}').map['hello'].value, 'world');
			});
		});

		describe('arrays', () => {
			it('empty', () => {
				assert.deepStrictEqual(parse('[]').items, []);
			});

			it('single key', () => {
				assert.deepStrictEqual(parse('[1]').items[0].value, 1);
				assert.deepStrictEqual(parse('["string"]').items[0].value, 'string');
			});

			it('complex', () => {
				const items = parse('[["hello"], 100]').items;

				assert.deepStrictEqual(
					items[0].items[0].value,
					'hello'
				);

				assert.deepStrictEqual(
					items[1].value,
					100
				);
			});
		});
	});

	describe('BETWEEN', () => {
		it('precedence with AND', () => {
			const node = parse('1 AND 2 BETWEEN 3 AND 4 AND 5');

			assert.ok(node.left.right instanceof SqlNodes.BetweenOperation);
			assert.ok(node.left.right.left.value === 2);
			assert.ok(node.left.right.rangeStart.value === 3);
			assert.ok(node.left.right.rangeEnd.value === 4);
		});

		it('precedence with arithmetical', () => {
			const node = parse('1 AND 2 + 2 BETWEEN 3 + 3 AND 4 + 4 AND 5');

			assert.ok(node.left.right instanceof SqlNodes.BetweenOperation);
			assert.ok(node.left.right.left instanceof SqlNodes.BinaryArithmeticOperation);
			assert.ok(node.left.right.left.left.value === 2);
			assert.ok(node.left.right.rangeStart instanceof SqlNodes.BinaryArithmeticOperation);
			assert.ok(node.left.right.rangeStart.left.value === 3);
			assert.ok(node.left.right.rangeEnd instanceof SqlNodes.BinaryArithmeticOperation);
			assert.ok(node.left.right.rangeEnd.left.value === 4);
		});
	});

	describe('INTERVAL', () => {
		it('single', () => {
			const nodeOp = parse('1 + INTERVAL 10 SECOND');
			const interval = nodeOp.right;

			assert.ok(nodeOp instanceof SqlNodes.IntervalOperation);
			assert.ok(interval instanceof SqlNodes.Interval);

			assert.strictEqual(interval.deltas.length, 1);
			assert.strictEqual(interval.deltas[0].unit, 'second');
			assert.strictEqual(interval.deltas[0].expression.value, 10);
		});

		it('multi', () => {
			const nodeOp = parse('1 + INTERVAL 1 YEAR 2 MONTH 3 DAY 4 HOUR 5 MINUTE 6 SECOND');
			const interval = nodeOp.right;

			assert.ok(nodeOp instanceof SqlNodes.IntervalOperation);
			assert.ok(interval instanceof SqlNodes.Interval);

			assert.strictEqual(interval.deltas.length, 6);
			assert.strictEqual(interval.deltas[0].unit, 'year');
			assert.strictEqual(interval.deltas[0].expression.value, 1);
			assert.strictEqual(interval.deltas[1].unit, 'month');
			assert.strictEqual(interval.deltas[1].expression.value, 2);
			assert.strictEqual(interval.deltas[2].unit, 'day');
			assert.strictEqual(interval.deltas[2].expression.value, 3);
			assert.strictEqual(interval.deltas[3].unit, 'hour');
			assert.strictEqual(interval.deltas[3].expression.value, 4);
			assert.strictEqual(interval.deltas[4].unit, 'minute');
			assert.strictEqual(interval.deltas[4].expression.value, 5);
			assert.strictEqual(interval.deltas[5].unit, 'second');
			assert.strictEqual(interval.deltas[5].expression.value, 6);
		});
	});


	describe('calls', () => {
		it('empty', () => {
			const node = parse('FUNC()');

			assert.ok(node instanceof SqlNodes.Call);
			assert.deepStrictEqual(node.function.fragments, ['FUNC']);
			assert.deepStrictEqual(node.args.values, []);
		});

		it('with args', () => {
			const singleArg = parse('FUNC(1)');

			assert.ok(singleArg instanceof SqlNodes.Call);
			assert.deepStrictEqual(singleArg.function.fragments, ['FUNC']);
			assert.deepStrictEqual(singleArg.args.values.length, 1);

			const multiArgs = parse('FUNC(1, 2, 3)');

			assert.ok(multiArgs instanceof SqlNodes.Call);
			assert.deepStrictEqual(multiArgs.function.fragments, ['FUNC']);
			assert.deepStrictEqual(multiArgs.args.values.length, 3);
		});

		describe('COUNT', () => {
			it('COUNT() must throw error', () => {
				assert.throws(
					() => {
						return parse('COUNT()');
					},
					() => {
						return true;
					}
				);
			});

			it('COUNT(*)', () => {
				const nodeAst = parse('COUNT(*)');

				assert.ok(nodeAst instanceof SqlNodes.Call);
				assert.deepStrictEqual(nodeAst.function.fragments, ['COUNT']);
				assert.deepStrictEqual(nodeAst.args.values, []);
			});

			it('COUNT(exp)', () => {
				const node = parse('COUNT(hello)');

				assert.ok(node instanceof SqlNodes.Call);
				assert.deepStrictEqual(node.function.fragments, ['COUNT']);
				assert.deepStrictEqual(node.args.values.length, 1);
			});
		});
	});

	describe('NOT', () => {
		it('NOT IN', () => {
			const nodeUnstrict = parse('1 NOT IN(1, 2)');

			assert.ok(nodeUnstrict instanceof SqlNodes.UnaryLogicalOperation);
			assert.strictEqual(nodeUnstrict.operator, '!');
			assert.ok(nodeUnstrict.right instanceof SqlNodes.UnstrictIn);

			const nodeStrict = parse('1 NOT STRICT IN(1, 2)');

			assert.ok(nodeStrict instanceof SqlNodes.UnaryLogicalOperation);
			assert.strictEqual(nodeStrict.operator, '!');
			assert.ok(nodeStrict.right instanceof SqlNodes.StrictIn);
		});

		it('NOT LIKE', () => {
			const node = parse('1 NOT LIKE "a"');

			assert.ok(node instanceof SqlNodes.UnaryLogicalOperation);
			assert.strictEqual(node.operator, '!');
			assert.ok(node.right instanceof SqlNodes.LikeOperation);
			assert.strictEqual(node.right.caseSensitive, true);
		});

		it('NOT ILIKE', () => {
			const node = parse('1 NOT ILIKE "a"');

			assert.ok(node instanceof SqlNodes.UnaryLogicalOperation);
			assert.strictEqual(node.operator, '!');
			assert.ok(node.right instanceof SqlNodes.LikeOperation);
			assert.strictEqual(node.right.caseSensitive, false);
		});

		it('NOT REGEXP', () => {
			const node = parse('1 NOT REGEXP "/hi/"');

			assert.ok(node instanceof SqlNodes.UnaryLogicalOperation);
			assert.strictEqual(node.operator, '!');
			assert.ok(node.right instanceof SqlNodes.RegexpOperation);
		});

		it('NOT IS', () => {
			const node = parse('1 IS NOT NUMBER');

			assert.ok(node instanceof SqlNodes.UnaryLogicalOperation);
			assert.strictEqual(node.operator, '!');
			assert.ok(node.right instanceof SqlNodes.IsOperation);
		});

		it('unary !', () => {
			const node = parse('!10');

			assert.ok(node instanceof SqlNodes.UnaryLogicalOperation);
			assert.strictEqual(node.operator, '!');
			assert.ok(node.right instanceof SqlNodes.Number);
		});
	});
});
