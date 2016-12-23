'use strict';

const assert = require('assert');
const Avg = require('../../../../src/sqlFunctions/aggregation/AVG');
const DataType = require('../../../../src/DataType');

describe('SQL function AVG()', () => {
	it('.updateSync() with undefined and null', () => {
		const avg = new Avg;

		avg.init();

		assert.strictEqual(avg.resultSync(), null);

		avg.updateSync([10]);
		assert.strictEqual(avg.resultSync(), 10);

		avg.updateSync([undefined]);
		assert.strictEqual(avg.resultSync(), 10);

		avg.updateSync([null]);
		assert.strictEqual(avg.resultSync(), 10);
	});

	it('.updateSync() with scalars', () => {
		const avg = new Avg;

		avg.init();

		avg.updateSync([5]);
		avg.updateSync([11]);
		assert.strictEqual(avg.resultSync(), 8);

		avg.updateSync([2]);
		assert.strictEqual(avg.resultSync(), 6);
	});

	it('.updateSync() with non-numbers', () => {
		const avg = new Avg;

		avg.init();

		avg.updateSync([5]);
		avg.updateSync(['11']);
		assert.strictEqual(avg.resultSync(), 8);

		avg.updateSync(['2']);
		assert.strictEqual(avg.resultSync(), 6);

		avg.updateSync([['array']]);
		assert.strictEqual(avg.resultSync(), 6);

		avg.updateSync([{object: 1}]);
		assert.strictEqual(avg.resultSync(), 6);

		avg.updateSync(['wrong number string']);
		assert.strictEqual(avg.resultSync(), 6);
	});

	it('reinit', () => {
		const avg = new Avg;

		avg.init();
		assert.strictEqual(avg.resultSync(), null);

		avg.updateSync([10]);
		assert.strictEqual(avg.resultSync(), 10);

		avg.deinit();
		avg.init();

		assert.strictEqual(avg.resultSync(), null);

		avg.updateSync([5]);
		assert.strictEqual(avg.resultSync(), 5);
	});

	it('dataType()', () => {
		assert.strictEqual(Avg.dataType(), DataType.NUMBER);
	});

});
