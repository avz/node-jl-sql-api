'use strict';

const assert = require('assert');
const Sum = require('../../../../src/sqlFunctions/aggregation/SUM');
const DataType = require('../../../../src/DataType');

describe('SQL function SUM()', () => {
	it('update() with undefined and null', () => {
		const sum = new Sum;

		sum.init();

		assert.strictEqual(sum.result(), 0);

		sum.update([10]);
		assert.strictEqual(sum.result(), 10);

		sum.update([undefined]);
		assert.strictEqual(sum.result(), 10);

		sum.update([null]);
		assert.strictEqual(sum.result(), 10);
	});

	it('update() with scalars', () => {
		const min = new Sum;

		min.init();

		min.update([5]);
		min.update([10]);
		assert.strictEqual(min.result(), 15);

		min.update([2]);
		assert.strictEqual(min.result(), 17);
	});

	it('update() with non-numbers', () => {
		const min = new Sum;

		min.init();

		min.update([5]);
		min.update(['10']);
		assert.strictEqual(min.result(), 15);

		min.update(['2']);
		assert.strictEqual(min.result(), 17);

		min.update([['array']]);
		assert.strictEqual(min.result(), 17);

		min.update([{object: 1}]);
		assert.strictEqual(min.result(), 17);

		min.update(['wrong number string']);
		assert.strictEqual(min.result(), 17);
	});

	it('reinit', () => {
		const min = new Sum;

		min.init();
		assert.strictEqual(min.result(), 0);

		min.update([10]);
		assert.strictEqual(min.result(), 10);

		min.deinit();
		min.init();

		assert.strictEqual(min.result(), 0);

		min.update([5]);
		assert.strictEqual(min.result(), 5);
	});

	it('dataType()', () => {
		assert.strictEqual(Sum.dataType(), DataType.NUMBER);
	});

});
