'use strict';

const assert = require('assert');
const SqlToJsHelpers = require('../../src/SqlToJsHelpers');

describe('SqlToJsHelpers', () => {
	const helpers = new SqlToJsHelpers(null);

	describe('unstrictIn()', () => {
		it('scalar', () => {
			assert.strictEqual(helpers.unstrictIn([1, 2, 3], 2), true);
			assert.strictEqual(helpers.unstrictIn([1, 2, 3], 4), false);
			assert.strictEqual(helpers.unstrictIn([1, 2, 3], '2'), true);
			assert.strictEqual(helpers.unstrictIn([1, '2', 3], 2), true);
			assert.strictEqual(helpers.unstrictIn([1, '2', 3], '2'), true);
		});
	});
});
