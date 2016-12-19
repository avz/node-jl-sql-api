'use strict';

const assert = require('assert');
const Count = require('../../../../src/sqlFunctions/aggregation/COUNT');
const DataType = require('../../../../src/DataType');

describe('SQL function COUNT()', () => {
	it('.updateSync(field) with undefined and null', () => {
		const count = new Count;

		count.init();

		assert.strictEqual(count.resultSync(), 0);

		count.updateSync(['hi']);
		assert.strictEqual(count.resultSync(), 1);

		count.updateSync([undefined]);
		assert.strictEqual(count.resultSync(), 1);

		count.updateSync([null]);
		assert.strictEqual(count.resultSync(), 1);
	});

	it('.updateSync(*)', () => {
		const count = new Count;

		count.init();

		assert.strictEqual(count.resultSync(), 0);

		count.updateSync([]);
		assert.strictEqual(count.resultSync(), 1);
	});

	it('.updateSync(field) with scalars', () => {
		const max = new Count;

		max.init();

		max.updateSync(['hi']);
		assert.strictEqual(max.resultSync(), 1);

		max.updateSync(['ho']);
		assert.strictEqual(max.resultSync(), 2);
	});

	it('reinit', () => {
		const max = new Count;

		max.init();
		assert.strictEqual(max.resultSync(), 0);

		max.updateSync(['hi']);
		assert.strictEqual(max.resultSync(), 1);

		max.deinit();
		max.init();

		assert.strictEqual(max.resultSync(), 0);

		max.updateSync(['ho']);
		assert.strictEqual(max.resultSync(), 1);
	});

	it('dataType()', () => {
		assert.strictEqual(Count.dataType(), DataType.NUMBER);
	});
});
