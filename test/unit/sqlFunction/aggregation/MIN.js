'use strict';

const assert = require('assert');
const Min = require('../../../../src/sqlFunctions/aggregation/MIN');
const DataType = require('../../../../src/DataType');

describe('SQL function MIN()', () => {
	it('update() with undefined and null', () => {
		const min = new Min;

		min.init();

		assert.strictEqual(min.result(), null);

		min.update([10]);
		assert.strictEqual(min.result(), 10);

		min.update([undefined]);
		assert.strictEqual(min.result(), 10);

		min.update([null]);
		assert.strictEqual(min.result(), 10);
	});

	it('update() with scalars', () => {
		const min = new Min;

		min.init();

		min.update([5]);
		min.update([10]);
		assert.strictEqual(min.result(), 5);

		min.update([2]);
		assert.strictEqual(min.result(), 2);
	});

	it('reinit', () => {
		const min = new Min;

		min.init();
		assert.strictEqual(min.result(), null);

		min.update([10]);
		assert.strictEqual(min.result(), 10);

		min.deinit();
		min.init();

		assert.strictEqual(min.result(), null);

		min.update([5]);
		assert.strictEqual(min.result(), 5);
	});

	it('dataType()', () => {
		assert.strictEqual(Min.dataType(), DataType.MIXED);
	});

});
