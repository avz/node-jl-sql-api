'use strict';

const assert = require('assert');
const STRING = require('../../../../src/sqlFunctions/basic/STRING');
const DataType = require('../../../../src/DataType');

describe('SQL function STRING()', () => {
	it('data type', () => {
		assert.strictEqual(STRING.dataType(), DataType.STRING);
	});

	it('result', () => {
		const f = new STRING;

		assert.strictEqual(f.call([1]), '1');
		assert.strictEqual(f.call([null]), 'null');
		assert.strictEqual(f.call([[]]), '[object Object]');
		assert.strictEqual(f.call([true]), 'true');
		assert.strictEqual(f.call([false]), 'false');
		assert.strictEqual(f.call([undefined]), '');
	});
});
