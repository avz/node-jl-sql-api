'use strict';

const assert = require('assert');
const Max = require('../../../../src/sqlFunctions/aggregation/MAX');
const DataType = require('../../../../src/DataType');

describe('SQL function MAX()', () => {
	it('update() with undefined and null', () => {
		const max = new Max;

		max.init();

		assert.strictEqual(max.result(), null);

		max.update([10]);
		assert.strictEqual(max.result(), 10);

		max.update([undefined]);
		assert.strictEqual(max.result(), 10);

		max.update([null]);
		assert.strictEqual(max.result(), 10);
	});

	it('update() with scalars', () => {
		const max = new Max;

		max.init();

		max.update([10]);
		max.update([5]);
		assert.strictEqual(max.result(), 10);

		max.update([15]);
		assert.strictEqual(max.result(), 15);
	});

	it('reinit', () => {
		const max = new Max;

		max.init();
		assert.strictEqual(max.result(), null);

		max.update([10]);
		assert.strictEqual(max.result(), 10);

		max.deinit();
		max.init();

		assert.strictEqual(max.result(), null);

		max.update([5]);
		assert.strictEqual(max.result(), 5);
	});

	it('dataType()', () => {
		assert.strictEqual(Max.dataType(), DataType.MIXED);
	});
});
