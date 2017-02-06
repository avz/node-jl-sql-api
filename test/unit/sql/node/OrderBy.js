'use strict';

const assert = require('assert');
const OrderBy = require('../../../../src/sql/nodes/OrderBy');

describe('OrderBy', () => {
	it('case-insensitive', () => {
		assert.strictEqual((new OrderBy(null, 'DeSc')).direction, 'DESC');
		assert.strictEqual((new OrderBy(null, 'aSc')).direction, 'ASC');
	});
});
