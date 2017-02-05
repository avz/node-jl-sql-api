'use strict';

const assert = require('assert');
const UNIX_TIMESTAMP = require('../../../../src/sqlFunctions/basic/UNIX_TIMESTAMP');
const DataType = require('../../../../src/DataType');

describe('SQL function UNIX_TIMESTAMP()', () => {
	it('data type', () => {
		assert.strictEqual(UNIX_TIMESTAMP.dataType(), DataType.NUMBER);
	});

	it('conditions', () => {
		const f = new UNIX_TIMESTAMP;

		assert.strictEqual(f.call(['invalid']), null);
		assert.strictEqual(f.call([0]), 0);
		assert.ok(f.call([]) <= Date.now() / 1000);
	});
});
