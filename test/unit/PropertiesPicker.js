'use strict';

const assert = require('assert');
const PropertiesPicker = require('../../src/PropertiesPicker');

describe('PropertiesPicker', () => {
	const object = {
		topObject: {
			subScalar: 100,
			subNull: null,
			subUndefined: undefined,
			subObject: {
				subSubScalar: 300
			}
		},
		topScalar: 200,
		topNull: null,
		topUndefined: undefined
	};

	describe('sliceProperties', () => {
		it('copy from scalar', () => {
			const picker = new PropertiesPicker(new Map([
				[['a'], ['topScalar']],
				[['b'], ['topNull']],
				[['c'], ['topUndefined']],
				[['d'], ['unexistent']]
			]));

			const o = picker.sliceProperties(object);

			assert.strictEqual(o.a, object.topScalar);
			assert.strictEqual(o.b, object.topNull);
			assert.strictEqual(o.c, object.topUndefined);
			assert.strictEqual(o.d, undefined);
		});

		it('copy from function', () => {
			let getterCallsCount = 0;

			const getter = (orig) => {
				assert.strictEqual(orig, object);
				getterCallsCount++;

				return 'result_' + getterCallsCount;
			};

			const picker = new PropertiesPicker(new Map([
				[['a'], getter],
				[['b'], getter],
				[['c', 'd'], getter]
			]));

			const o = picker.sliceProperties(object);

			assert.strictEqual(o.a, 'result_1');
			assert.strictEqual(o.b, 'result_2');
			assert.strictEqual(o.c.d, 'result_3');

			assert.strictEqual(Object.keys(o).length, 3);
			assert.strictEqual(Object.keys(o.c).length, 1);

			assert.strictEqual(getterCallsCount, 3);
		});
	});

	describe('mergeProperties', () => {
		it('basic', () => {
			const picker = new PropertiesPicker(new Map([
				[['a'], ['topScalar']],
				[['b'], ['topNull']],
				[['c'], ['topUndefined']],
				[['d'], ['topUndefined']],
				[['f'], () => {
					return 'hi';
				}]
			]));

			const dest = {
				e: 'hello'
			};

			const o = picker.mergeProperties(object, dest);

			assert.strictEqual(o, dest);
			assert.strictEqual(o.a, object.topScalar);
			assert.strictEqual(o.b, object.topNull);
			assert.strictEqual(o.c, object.topUndefined);
			assert.strictEqual(o.d, undefined);
			assert.strictEqual(o.e, 'hello');
			assert.strictEqual(o.f, 'hi');
		});

		it('replace', () => {
			const picker = new PropertiesPicker(new Map([
				[['a'], ['topScalar']],
				[['b', 'c'], ['topNull']]
			]));

			const dest = {
				a: 'hello',
				b: {
					c: 'world',
					d: 1
				}
			};

			const o = picker.mergeProperties(object, dest);

			assert.strictEqual(o, dest);

			assert.strictEqual(o.a, object.topScalar);
			assert.strictEqual(o.b.c, object.topNull);
			assert.strictEqual(o.b.d, 1);
		});

		it('deep non-object', () => {
			const picker = new PropertiesPicker(new Map([
				[['a', 'b'], ['topScalar']]
			]));

			const dest = {
				a: 'hello'
			};

			const o = picker.mergeProperties(object, dest);

			assert.strictEqual(o.a, 'hello');
			assert.strictEqual(o.a.b, undefined);
		});
	});
});
