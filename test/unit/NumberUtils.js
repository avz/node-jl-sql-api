'use strict';

const assert = require('assert');
const NumberUtils = require('../../src/NumberUtils');

describe('NumberUtils', () => {
	describe('exponentialStringToDec()', () => {
		it('zero', () => {
			assert.strictEqual(NumberUtils.exponentialStringToDec('0'), '0');
		});

		it('positive number, positive exp', () => {
			assert.strictEqual(NumberUtils.exponentialStringToDec('1e2'), '100');
			assert.strictEqual(NumberUtils.exponentialStringToDec('1.2e2'), '120');
			assert.strictEqual(NumberUtils.exponentialStringToDec('1.23e2'), '123');
		});

		it('positive number, negative exp', () => {
			assert.strictEqual(NumberUtils.exponentialStringToDec('1e-2'), '0.01');
			assert.strictEqual(NumberUtils.exponentialStringToDec('1.2e-2'), '0.012');
			assert.strictEqual(NumberUtils.exponentialStringToDec('1.23e-2'), '0.0123');
		});

		it('negative number, positive exp', () => {
			assert.strictEqual(NumberUtils.exponentialStringToDec('-1e2'), '-100');
			assert.strictEqual(NumberUtils.exponentialStringToDec('-1.2e2'), '-120');
			assert.strictEqual(NumberUtils.exponentialStringToDec('-1.23e2'), '-123');
		});

		it('negative number, negative exp', () => {
			assert.strictEqual(NumberUtils.exponentialStringToDec('-1e-2'), '-0.01');
			assert.strictEqual(NumberUtils.exponentialStringToDec('-1.2e-2'), '-0.012');
			assert.strictEqual(NumberUtils.exponentialStringToDec('-1.23e-2'), '-0.0123');
		});
	});

	describe('toDecString()', () => {
		it('small int', () => {
			assert.strictEqual(NumberUtils.toDecString(10), '10');
			assert.strictEqual(NumberUtils.toDecString(123), '123');
			assert.strictEqual(NumberUtils.toDecString(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER + '');

			assert.strictEqual(NumberUtils.toDecString(-10), '-10');
			assert.strictEqual(NumberUtils.toDecString(-123), '-123');
			assert.strictEqual(NumberUtils.toDecString(-Number.MAX_SAFE_INTEGER), '-' + Number.MAX_SAFE_INTEGER);
		});

		it('big int', () => {
			assert.strictEqual(NumberUtils.toDecString(100000000000000000000000), '100000000000000000000000');
			assert.strictEqual(NumberUtils.toDecString(-100000000000000000000000), '-100000000000000000000000');
		});

		it('small float', () => {
			assert.strictEqual(NumberUtils.toDecString(1e-2), '0.01');
			assert.strictEqual(NumberUtils.toDecString(1e-20), '0.00000000000000000001');
			assert.strictEqual(NumberUtils.toDecString(-1e-2), '-0.01');
			assert.strictEqual(NumberUtils.toDecString(-1e-20), '-0.00000000000000000001');
		});

		it('big float', () => {
			assert.strictEqual(NumberUtils.toDecString(1.123456e+25), '11234560000000000000000000');
			assert.strictEqual(NumberUtils.toDecString(-1.123456e+25), '-11234560000000000000000000');
		});

		it('zero', () => {
			assert.strictEqual(NumberUtils.toDecString(0), '0');
		});

		it('NaN', () => {
			assert.strictEqual(NumberUtils.toDecString(NaN), 'NaN');
		});

		it('Infinity', () => {
			assert.strictEqual(NumberUtils.toDecString(Infinity), 'Infinity');
			assert.strictEqual(NumberUtils.toDecString(-Infinity), '-Infinity');
		});
	});
});
