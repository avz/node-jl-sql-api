'use strict';

const assert = require('assert');
const FLOOR = require('../../../../src/sqlFunctions/basic/FLOOR');
const DataType = require('../../../../src/DataType');

describe('SQL function FLOOR()', () => {
	it('data type', () => {
		assert.strictEqual(FLOOR.dataType(), DataType.NUMBER);
	});

	it('result', () => {
		const f = new FLOOR;

		assert.strictEqual(f.call([1.1]), 1);
		assert.strictEqual(f.call([1.9]), 1);
		assert.strictEqual(f.call(['1.1']), 1);
		assert.strictEqual(f.call(['hello']), null);
	});
});
