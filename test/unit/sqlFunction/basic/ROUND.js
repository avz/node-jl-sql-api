'use strict';

const assert = require('assert');
const ROUND = require('../../../../src/sqlFunctions/basic/ROUND');
const DataType = require('../../../../src/DataType');

describe('SQL function ROUND()', () => {
	it('data type', () => {
		assert.strictEqual(ROUND.dataType(), DataType.NUMBER);
	});

	it('result', () => {
		const f = new ROUND;

		assert.strictEqual(f.call([1.1]), 1);
		assert.strictEqual(f.call([1.9]), 2);
		assert.strictEqual(f.call(['1.1']), 1);
		assert.strictEqual(f.call(['hello']), null);
	});
});
