'use strict';

const assert = require('assert');
const Min = require('../../../../src/sqlFunctions/aggregation/MIN');
const DataType = require('../../../../src/DataType');

describe('SQL function MIN()', () => {
	it('.updateSync() with undefined and null', () => {
		const min = new Min;

		min.init();

		assert.strictEqual(min.resultSync(), null);

		min.updateSync([10]);
		assert.strictEqual(min.resultSync(), 10);

		min.updateSync([undefined]);
		assert.strictEqual(min.resultSync(), 10);

		min.updateSync([null]);
		assert.strictEqual(min.resultSync(), 10);
	});

	it('.updateSync() with scalars', () => {
		const min = new Min;

		min.init();

		min.updateSync([5]);
		min.updateSync([10]);
		assert.strictEqual(min.resultSync(), 5);

		min.updateSync([2]);
		assert.strictEqual(min.resultSync(), 2);
	});

	it('reinit', () => {
		const min = new Min;

		min.init();
		assert.strictEqual(min.resultSync(), null);

		min.updateSync([10]);
		assert.strictEqual(min.resultSync(), 10);

		min.deinit();
		min.init();

		assert.strictEqual(min.resultSync(), null);

		min.updateSync([5]);
		assert.strictEqual(min.resultSync(), 5);
	});

	it('dataType()', () => {
		assert.strictEqual(Min.dataType(), DataType.MIXED);
	});

});
