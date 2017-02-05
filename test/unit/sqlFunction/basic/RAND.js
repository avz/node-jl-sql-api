'use strict';

const assert = require('assert');
const RAND = require('../../../../src/sqlFunctions/basic/RAND');
const DataType = require('../../../../src/DataType');

describe('SQL function RAND()', () => {
	it('data type', () => {
		assert.strictEqual(RAND.dataType(), DataType.NUMBER);
	});

	it('result', () => {
		const f = new RAND;

		assert.strictEqual(typeof(f.call([])), 'number');
	});
});
