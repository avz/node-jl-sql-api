'use strict';

const assert = require('assert');
const Parser = require('../../../src/sql/Parser');

describe('SQL Parser', () => {
	const parse = (exp) => {
		return Parser.parse('SELECT * WHERE ' + exp).where;
	};

	describe('JSON', () => {
		describe('scalars', () => {
			const parseScalar = exp => {
				return parse('[' + exp + ']').value[0];
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
				assert.deepStrictEqual(parse('{}').value, {});
			});

			it('single key', () => {
				assert.deepStrictEqual(parse('{"hello": "world"}').value, {hello: 'world'});
			});

			it('complex', () => {
				assert.deepStrictEqual(
					parse('{"hello": {"wo\\nrld": 100}, "true": true}').value,
					{hello: {'wo\nrld': 100}, 'true': true}
				);
			});
		});

		describe('arrays', () => {
			it('empty', () => {
				assert.deepStrictEqual(parse('[]').value, []);
			});

			it('single key', () => {
				assert.deepStrictEqual(parse('[1]').value, [1]);
				assert.deepStrictEqual(parse('["string"]').value, ['string']);
			});

			it('complex', () => {
				assert.deepStrictEqual(
					parse('[["hello"], 100]').value,
					[['hello'], 100]
				);
			});
		});
	});
});
