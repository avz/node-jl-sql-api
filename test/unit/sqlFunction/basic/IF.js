'use strict';

const assert = require('assert');
const IF = require('../../../../src/sqlFunctions/basic/IF');
const DataType = require('../../../../src/DataType');

describe('SQL function IF()', () => {
	it('data type', () => {
		assert.strictEqual(IF.dataType(), DataType.MIXED);
	});

	it('conditions', () => {
		const f = new IF;

		assert.strictEqual(f.call([true, 'YES', 'NO']), 'YES');
		assert.strictEqual(f.call([1, 'YES', 'NO']), 'YES');
		assert.strictEqual(f.call([{}, 'YES', 'NO']), 'YES');
		assert.strictEqual(f.call([false, 'YES', 'NO']), 'NO');
		assert.strictEqual(f.call([null, 'YES', 'NO']), 'NO');
		assert.strictEqual(f.call(['', 'YES', 'NO']), 'NO');
		assert.strictEqual(f.call([0, 'YES', 'NO']), 'NO');
	});
});
