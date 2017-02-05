'use strict';

const assert = require('assert');
const DATE = require('../../../../src/sqlFunctions/basic/DATE');
const DataType = require('../../../../src/DataType');

describe('SQL function DATE()', () => {
	it('data type', () => {
		assert.strictEqual(DATE.dataType(), DataType.STRING);
	});

	it('no args', () => {
		const f = new DATE;

		assert.ok(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(f.call([])));
	});

	it('with arg', () => {
		const f = new DATE;

		assert.strictEqual(f.call(['2017-02-05 01:02:03']), '2017-02-05');
		assert.strictEqual(f.call(['2017-02-05']), '2017-02-05');
		assert.strictEqual(f.call(['2017-02-05T01:02:03']), '2017-02-05');
	});

	it('invalid arg', () => {
		const f = new DATE;

		assert.strictEqual(f.call([true]), null);
	});

	it('invalid date', () => {
		const f = new DATE;

		assert.strictEqual(f.call(['hello']), null);
	});
});
