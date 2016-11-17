'use strict';

const assert = require('assert');
const PropertiesPicker = require('../../src/PropertiesPicker');

describe('PropertiesPicker', () => {
	const picker = new PropertiesPicker;
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

	describe('getProperty()', () => {
		it('exists', () => {
			assert.strictEqual(picker.getProperty(['topScalar'], object.topScalar));
		});

		it('exists - null', () => {
			assert.strictEqual(picker.getProperty(['topNull'], object.topNull));
		});

		it('exists - undefined', () => {
			assert.strictEqual(picker.getProperty(['topUndefined'], object.topUndefined));
		});

		it('not exists', () => {
			assert.strictEqual(picker.getProperty(['nonexistent'], undefined));
		});

		it('sub-property exists', () => {
			assert.strictEqual(picker.getProperty(['topObject', 'subScalar'], object.topObject.subScalar));
			assert.strictEqual(picker.getProperty(['topObject', 'subObject'], object.topObject.subScalar));
		});

		it('sub-property not exists', () => {
			assert.strictEqual(picker.getProperty(['topObject', 'nonexistent1', 'nonexistent2'], undefined));
		});

		it('property of null and undefined', () => {
			assert.strictEqual(picker.getProperty(['topNull', 'p1', 'p2'], undefined));
			assert.strictEqual(picker.getProperty(['topUndefined', 'p1', 'p2'], undefined));
		})
	});

	describe('setProperty()', () => {
		let o;

		beforeEach(() => {
			o = JSON.parse(JSON.stringify(object));
		});

		it('add top-level', () => {
			picker.setProperty(['new'], o, 'hello');
			assert.strictEqual(o.new, 'hello');
		});

		it('modify top-level', () => {
			picker.setProperty(['topScalar'], o, 'hello');
			assert.strictEqual(o.topScalar, 'hello');
		});

		it('property of non-existent', () => {
			picker.setProperty(['newObject', 'newSubobject', 'newProp'], o, 'hello');
			assert.strictEqual(o.newObject.newSubobject.newProp, 'hello');
		});

		it('property of scalar', () => {
			picker.setProperty(['topScalar', 'prop'], o, 'hello');
			assert.strictEqual(o.topScalar.prop, undefined);
		});

		it('property of null', () => {
			picker.setProperty(['topNull', 'prop'], o, 'hello');
		});
	});

	describe('copyPropertiesMap', () => {
		let o = {};

		beforeEach(() => {
			o = {};
		});

		it('copy from scalar', () => {
			picker.copyPropertiesMap(new Map([
				[['a'], ['topScalar']],
				[['b'], ['topNull']],
				[['c'], ['topUndefined']],
				[['d'], ['unexistent']]
			]), object, o);

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

			picker.copyPropertiesMap(new Map([
				[['a'], getter],
				[['b'], getter],
				[['c', 'd'], getter]
			]), object, o);

			assert.strictEqual(o.a, 'result_1');
			assert.strictEqual(o.b, 'result_2');
			assert.strictEqual(o.c.d, 'result_3');

			assert.strictEqual(Object.keys(o).length, 3);
			assert.strictEqual(Object.keys(o.c).length, 1);

			assert.strictEqual(getterCallsCount, 3);
		});
	});

	describe('copyPropertiesList', () => {
		let o = {};

		beforeEach(() => {
			o = {};
		});

		it('just copy', () => {
			picker.copyProperties([['topScalar'], ['topObject', 'subScalar']], object, o);

			assert.strictEqual(o.topScalar, object.topScalar);
			assert.strictEqual(o.topObject.subScalar, object.topObject.subScalar);

			assert.strictEqual(Object.keys(o).length, 2);
			assert.strictEqual(Object.keys(o.topObject).length, 1);
		});

		it('copy undefined', () => {
			picker.copyProperties([['undef'], ['newObject', 'undef']], object, o);

			assert.strictEqual(Object.keys(o).length, 0);
		});
	});
});
