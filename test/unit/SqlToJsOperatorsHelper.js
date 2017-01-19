'use strict';

const assert = require('assert');
const SqlToJsOperatorsHelper = require('../../src/SqlToJsOperatorsHelper');

describe('SqlToJsHelpers', () => {
	const helper = new SqlToJsOperatorsHelper(null);

	describe('unstrictIn()', () => {
		it('scalar', () => {
			assert.strictEqual(helper.unstrictIn([1, 2, 3], 2), true);
			assert.strictEqual(helper.unstrictIn([1, 2, 3], 4), false);
			assert.strictEqual(helper.unstrictIn([1, 2, 3], '2'), true);
			assert.strictEqual(helper.unstrictIn([1, '2', 3], 2), true);
			assert.strictEqual(helper.unstrictIn([1, '2', 3], '2'), true);
		});
	});
});
