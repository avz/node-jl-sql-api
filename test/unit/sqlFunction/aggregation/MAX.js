'use strict';

const assert = require('assert');
const Max = require('../../../../src/sqlFunctions/aggregation/MAX');
const DataType = require('../../../../src/DataType');

describe('SQL function MAX()', () => {
	it('.updateSync() with undefined and null', () => {
		const max = new Max;

		max.init();

		assert.strictEqual(max.resultSync(), null);

		max.updateSync([10]);
		assert.strictEqual(max.resultSync(), 10);

		max.updateSync([undefined]);
		assert.strictEqual(max.resultSync(), 10);

		max.updateSync([null]);
		assert.strictEqual(max.resultSync(), 10);
	});

	it('.updateSync() with scalars', () => {
		const max = new Max;

		max.init();

		max.updateSync([10]);
		max.updateSync([5]);
		assert.strictEqual(max.resultSync(), 10);

		max.updateSync([15]);
		assert.strictEqual(max.resultSync(), 15);
	});

	it('reinit', () => {
		const max = new Max;

		max.init();
		assert.strictEqual(max.resultSync(), null);

		max.updateSync([10]);
		assert.strictEqual(max.resultSync(), 10);

		max.deinit();
		max.init();

		assert.strictEqual(max.resultSync(), null);

		max.updateSync([5]);
		assert.strictEqual(max.resultSync(), 5);
	});

	it('dataType()', () => {
		assert.strictEqual(Max.dataType(), DataType.MIXED);
	});
});
