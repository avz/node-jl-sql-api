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

	describe('likeCompileRegex()', () => {
		const cases = [
			[['hello', true], '/^hello$/'],
			[['hello', false], '/^hello$/i'],
			[['hel/lo', false], '/^hel\\/lo$/i'],
			[['he%lo', false], '/^he[\\s\\S]*lo$/i'],
			[['he_lo', false], '/^he[\\s\\S]lo$/i'],
			[['he\\%lo', false], '/^he%lo$/i'],
			[['he\\_lo', false], '/^he_lo$/i'],
			[['he\\/lo', false], '/^he\\\\\\/lo$/i'],
			[['', true], '/^$/'],
			[['%', true], '/^[\\s\\S]*$/'],
			[['%a%', true], '/^[\\s\\S]*a[\\s\\S]*$/'],
			[['_a_', true], '/^[\\s\\S]a[\\s\\S]$/'],
			[['_a%%', true], '/^[\\s\\S]a[\\s\\S]*[\\s\\S]*$/'],
			[['_', true], '/^[\\s\\S]$/'],
			[['%%%%%%', true], '/^[\\s\\S]*[\\s\\S]*[\\s\\S]*[\\s\\S]*[\\s\\S]*[\\s\\S]*$/']
		];

		for (const c of cases) {
			assert.strictEqual(helper.likeCompileRegex(...c[0]).toString(), c[1]);
		}
	});

	describe('between()', () => {
		it('ranges', () => {
			assert.strictEqual(helper.between(2, 1, 3), true);
			assert.strictEqual(helper.between(0, 1, 3), false);
			assert.strictEqual(helper.between(4, 1, 3), false);

			assert.strictEqual(helper.between('aab', 'aaa', 'aac'), true);
			assert.strictEqual(helper.between('aa', 'aaa', 'aac'), false);
			assert.strictEqual(helper.between('aad', 'aaa', 'aac'), false);
		});

		it('including boundaries', () => {
			assert.strictEqual(helper.between(1, 1, 2), true);
			assert.strictEqual(helper.between(2, 1, 2), true);

			assert.strictEqual(helper.between('aaa', 'aaa', 'aac'), true);
			assert.strictEqual(helper.between('aac', 'aaa', 'aac'), true);
		});
	});
});
