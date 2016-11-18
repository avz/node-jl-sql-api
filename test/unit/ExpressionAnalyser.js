'use strict';

const assert = require('assert');
const PreparingContext = require('../../src/PreparingContext');
const ExpressionAnalyser = require('../../src/ExpressionAnalyser');
const FunctionsMap = require('../../src/FunctionsMap');
const BasicFunction = require('../../src/BasicFunction');
const AggregationFunction = require('../../src/AggregationFunction');
const DataType = require('../../src/DataType');
const SqlParser = require('../../src/sql/Parser');

describe('ExpressionAnalyser', () => {
	const functions = {
		STRING: class extends BasicFunction {
			static dataType()
			{
				return DataType.STRING;
			}
		},
		BOOL: class extends BasicFunction {
			static dataType()
			{
				return DataType.BOOL;
			}
		},
		NUMBER: class extends BasicFunction {
			static dataType()
			{
				return DataType.NUMBER;
			}
		},
		AGG: class extends AggregationFunction {

		}
	};

	const functionsMap = new FunctionsMap;
	const context = new PreparingContext(undefined, functionsMap);
	const expressionAnalyser = new ExpressionAnalyser(context);

	for (const name in functions) {
		functionsMap.add([name], functions[name]);
	}

	describe('determineExpressionDataType()', () => {
		const cases = {
			'1 + 1': DataType.NUMBER,
			'STRING("hello") + 2 AS int2': DataType.NUMBER,
			'STRING("world") + STRING("aaaa")': DataType.NUMBER,
			'-hello': DataType.NUMBER,
			'NUMBER("string")': DataType.NUMBER,

			'STRING("world")': DataType.STRING,
			'"string"': DataType.STRING,

			'a && b': DataType.BOOL,
			'!c': DataType.BOOL,
			'a > c': DataType.BOOL,
			'BOOL(10)': DataType.BOOL,
			'a = b': DataType.BOOL,
			'a == b': DataType.BOOL,
			'a === b': DataType.BOOL,
		};

		for (const expression in cases) {
			const type = cases[expression];

			it('expression: `' + expression + '` must be ' + type, () => {
				const s = SqlParser.parse('SELECT ' + expression);
				const node = s.columns[0].expression;

				assert.strictEqual(expressionAnalyser.determineExpressionDataType(node), type);
			});
		}
	});

	describe('isAggregationExpression()', () => {
		const cases = {
			'AGG(hello)': true,
			'STRING(hello)': false,
			'STRING(AGG(hello))': true,
			'STRING(hello) + AGG(hello)': true,
			'(STRING(hello) + AGG(hello))': true,
			'1': false
		};

		for (const expression in cases) {
			const isAggregation = cases[expression];

			it('expression: `' + expression + '` must be ' + isAggregation, () => {
				const s = SqlParser.parse('SELECT ' + expression);
				const node = s.columns[0].expression;

				assert.strictEqual(expressionAnalyser.isAggregationExpression(node), isAggregation);
			});
		}
	});

	describe('extractUsedSources()', () => {
		const cases = {
			'hello': ['@'],
			'@hello.world': ['@hello'],
			'(hello)': ['@'],
			'(@hello.world)': ['@hello'],
			'a + @b.c + @b.d + @c.d + @c.e + @d.f': ['@', '@b', '@c', '@d'],
			'FUNC(a, @a.b)': ['@', '@a']
		};

		for (const sql in cases) {
			const result = cases[sql];

			it('expression `' + sql + '` mus use ' + result.join(', '), () => {
				const s = SqlParser.parse('SELECT ' + sql);
				const node = s.columns[0].expression;

				assert.deepEqual(expressionAnalyser.extractUsedSources(node).sort(), result);
			});
		}
	});
});
