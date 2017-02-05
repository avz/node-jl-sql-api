'use strict';

const assert = require('assert');
const NOW = require('../../../../src/sqlFunctions/basic/NOW');
const DataType = require('../../../../src/DataType');

describe('SQL function NOW()', () => {
	it('data type', () => {
		assert.strictEqual(NOW.dataType(), DataType.DATE);
	});

	it('result', () => {
		const f = new NOW;

		assert.ok(f.call([]) instanceof Date);
	});
});
