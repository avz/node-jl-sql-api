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
});
