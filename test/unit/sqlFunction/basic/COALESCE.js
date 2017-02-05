'use strict';

const assert = require('assert');
const COALESCE = require('../../../../src/sqlFunctions/basic/COALESCE');
const DataType = require('../../../../src/DataType');

describe('SQL function COALESCE()', () => {
	it('data type', () => {
		assert.strictEqual(COALESCE.dataType(), DataType.MIXED);
	});

	it('null args', () => {
		const f = new COALESCE;

		assert.strictEqual(f.call([undefined]), null);
	});

	it('conditions', () => {
		const f = new COALESCE;

		assert.strictEqual(f.call([0, 1, 2]), 0);
		assert.strictEqual(f.call([false, 1, 2]), false);
		assert.strictEqual(f.call([null, 1, 2]), 1);
		assert.strictEqual(f.call([undefined, 1, 2]), 1);
		assert.strictEqual(f.call([undefined, null, 2]), 2);
	});
});
