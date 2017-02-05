'use strict';

const assert = require('assert');
const CEIL = require('../../../../src/sqlFunctions/basic/CEIL');
const DataType = require('../../../../src/DataType');

describe('SQL function CEIL()', () => {
	it('data type', () => {
		assert.strictEqual(CEIL.dataType(), DataType.NUMBER);
	});

	it('result', () => {
		const f = new CEIL;

		assert.strictEqual(f.call([1.1]), 2);
		assert.strictEqual(f.call([1.9]), 2);
		assert.strictEqual(f.call(['1.1']), 2);
		assert.strictEqual(f.call(['hello']), null);
	});
});
