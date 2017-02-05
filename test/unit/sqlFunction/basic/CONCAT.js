'use strict';

const assert = require('assert');
const CONCAT = require('../../../../src/sqlFunctions/basic/CONCAT');
const DataType = require('../../../../src/DataType');

describe('SQL function CONCAT()', () => {
	it('data type', () => {
		assert.strictEqual(CONCAT.dataType(), DataType.STRING);
	});

	it('result', () => {
		const f = new CONCAT;

		assert.strictEqual(f.call([1, 2]), '12');
		assert.strictEqual(f.call([1, '2', 3]), '123');
		assert.strictEqual(f.call(['1', 2]), '12');
		assert.strictEqual(f.call(['1', [2, 3]]), '1[object Object]');
		assert.strictEqual(f.call(['1', null]), '1null');
		assert.strictEqual(f.call(['1', undefined, 2]), '12');
		assert.strictEqual(f.call(['1', {a: 'b'}]), '1[object Object]');
	});
});
