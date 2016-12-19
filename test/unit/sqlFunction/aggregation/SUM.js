'use strict';

const assert = require('assert');
const Sum = require('../../../../src/sqlFunctions/aggregation/SUM');
const DataType = require('../../../../src/DataType');

describe('SQL function SUM()', () => {
	it('.updateSync() with undefined and null', () => {
		const sum = new Sum;

		sum.init();

		assert.strictEqual(sum.resultSync(), 0);

		sum.updateSync([10]);
		assert.strictEqual(sum.resultSync(), 10);

		sum.updateSync([undefined]);
		assert.strictEqual(sum.resultSync(), 10);

		sum.updateSync([null]);
		assert.strictEqual(sum.resultSync(), 10);
	});

	it('.updateSync() with scalars', () => {
		const min = new Sum;

		min.init();

		min.updateSync([5]);
		min.updateSync([10]);
		assert.strictEqual(min.resultSync(), 15);

		min.updateSync([2]);
		assert.strictEqual(min.resultSync(), 17);
	});

	it('.updateSync() with non-numbers', () => {
		const min = new Sum;

		min.init();

		min.updateSync([5]);
		min.updateSync(['10']);
		assert.strictEqual(min.resultSync(), 15);

		min.updateSync(['2']);
		assert.strictEqual(min.resultSync(), 17);

		min.updateSync([['array']]);
		assert.strictEqual(min.resultSync(), 17);

		min.updateSync([{object: 1}]);
		assert.strictEqual(min.resultSync(), 17);

		min.updateSync(['wrong number string']);
		assert.strictEqual(min.resultSync(), 17);
	});

	it('reinit', () => {
		const min = new Sum;

		min.init();
		assert.strictEqual(min.resultSync(), 0);

		min.updateSync([10]);
		assert.strictEqual(min.resultSync(), 10);

		min.deinit();
		min.init();

		assert.strictEqual(min.resultSync(), 0);

		min.updateSync([5]);
		assert.strictEqual(min.resultSync(), 5);
	});

	it('dataType()', () => {
		assert.strictEqual(Sum.dataType(), DataType.NUMBER);
	});

});
