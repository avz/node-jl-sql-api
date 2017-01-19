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
});
