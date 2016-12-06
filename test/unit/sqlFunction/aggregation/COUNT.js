'use strict';

const assert = require('assert');
const Count = require('../../../../src/sqlFunctions/aggregation/COUNT');
const DataType = require('../../../../src/DataType');

describe('SQL function COUNT()', () => {
	it('update(field) with undefined and null', () => {
		const count = new Count;

		count.init();

		assert.strictEqual(count.result(), 0);

		count.update(['hi']);
		assert.strictEqual(count.result(), 1);

		count.update([undefined]);
		assert.strictEqual(count.result(), 1);

		count.update([null]);
		assert.strictEqual(count.result(), 1);
	});

	it('update(*)', () => {
		const count = new Count;

		count.init();

		assert.strictEqual(count.result(), 0);

		count.update([]);
		assert.strictEqual(count.result(), 1);
	});

	it('update(field) with scalars', () => {
		const max = new Count;

		max.init();

		max.update(['hi']);
		assert.strictEqual(max.result(), 1);

		max.update(['ho']);
		assert.strictEqual(max.result(), 2);
	});

	it('reinit', () => {
		const max = new Count;

		max.init();
		assert.strictEqual(max.result(), 0);

		max.update(['hi']);
		assert.strictEqual(max.result(), 1);

		max.deinit();
		max.init();

		assert.strictEqual(max.result(), 0);

		max.update(['ho']);
		assert.strictEqual(max.result(), 1);
	});

	it('dataType()', () => {
		assert.strictEqual(Count.dataType(), DataType.NUMBER);
	});
});
