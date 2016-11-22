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

	describe('getProperty()', () => {
		it('exists', () => {
			assert.strictEqual(PropertiesPicker.getProperty(['topScalar'], object.topScalar));
		});

		it('exists - null', () => {
			assert.strictEqual(PropertiesPicker.getProperty(['topNull'], object.topNull));
		});

		it('exists - undefined', () => {
			assert.strictEqual(PropertiesPicker.getProperty(['topUndefined'], object.topUndefined));
		});

		it('not exists', () => {
			assert.strictEqual(PropertiesPicker.getProperty(['nonexistent'], undefined));
		});

		it('sub-property exists', () => {
			assert.strictEqual(PropertiesPicker.getProperty(['topObject', 'subScalar'], object.topObject.subScalar));
			assert.strictEqual(PropertiesPicker.getProperty(['topObject', 'subObject'], object.topObject.subScalar));
		});

		it('sub-property not exists', () => {
			assert.strictEqual(PropertiesPicker.getProperty(['topObject', 'nonexistent1', 'nonexistent2'], undefined));
		});

		it('property of null and undefined', () => {
			assert.strictEqual(PropertiesPicker.getProperty(['topNull', 'p1', 'p2'], undefined));
			assert.strictEqual(PropertiesPicker.getProperty(['topUndefined', 'p1', 'p2'], undefined));
		});
	});

	describe('setProperty()', () => {
		let o;

		beforeEach(() => {
			o = JSON.parse(JSON.stringify(object));
		});

		it('add top-level', () => {
			PropertiesPicker.setProperty(['new'], o, 'hello');
			assert.strictEqual(o.new, 'hello');
		});

		it('modify top-level', () => {
			PropertiesPicker.setProperty(['topScalar'], o, 'hello');
			assert.strictEqual(o.topScalar, 'hello');
		});

		it('property of non-existent', () => {
			PropertiesPicker.setProperty(['newObject', 'newSubobject', 'newProp'], o, 'hello');
			assert.strictEqual(o.newObject.newSubobject.newProp, 'hello');
		});

		it('property of scalar', () => {
			PropertiesPicker.setProperty(['topScalar', 'prop'], o, 'hello');
			assert.strictEqual(o.topScalar.prop, undefined);
		});

		it('property of null', () => {
			PropertiesPicker.setProperty(['topNull', 'prop'], o, 'hello');
		});
	});

	describe('copyPropertiesMap', () => {
		let o = {};

		beforeEach(() => {
			o = {};
		});

		it('copy from scalar', () => {
			const picker = new PropertiesPicker(new Map([
				[['a'], ['topScalar']],
				[['b'], ['topNull']],
				[['c'], ['topUndefined']],
				[['d'], ['unexistent']]
			]));

			picker.copyProperties(object, o);

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

			picker.copyProperties(object, o);

			assert.strictEqual(o.a, 'result_1');
			assert.strictEqual(o.b, 'result_2');
			assert.strictEqual(o.c.d, 'result_3');

			assert.strictEqual(Object.keys(o).length, 3);
			assert.strictEqual(Object.keys(o.c).length, 1);

			assert.strictEqual(getterCallsCount, 3);
		});
	});
});
