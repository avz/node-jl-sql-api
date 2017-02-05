'use strict';

const assert = require('assert');
const FROM_UNIXTIME = require('../../../../src/sqlFunctions/basic/FROM_UNIXTIME');
const DataType = require('../../../../src/DataType');

describe('SQL function FROM_UNIXTIME()', () => {
	it('data type', () => {
		assert.strictEqual(FROM_UNIXTIME.dataType(), DataType.DATE);
	});

	it('invalid arg', () => {
		const f = new FROM_UNIXTIME;

		assert.strictEqual(f.call(['hello']), null);
	});

	it('valid arg', () => {
		const f = new FROM_UNIXTIME;

		assert.strictEqual(f.call(['1234567890']).getTime(), Date.parse('2009-02-13T23:31:30.000Z'));
		assert.strictEqual(f.call([1234567890]).getTime(), Date.parse('2009-02-13T23:31:30.000Z'));
		assert.strictEqual(f.call(['01234567890']).getTime(), Date.parse('2009-02-13T23:31:30.000Z'));
	});
});
