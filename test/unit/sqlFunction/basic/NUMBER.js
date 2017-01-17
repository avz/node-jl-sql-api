'use strict';

const assert = require('assert');
const NUMBER = require('../../../../src/sqlFunctions/basic/NUMBER');
const DataType = require('../../../../src/DataType');

describe('SQL function NUMBER()', () => {
	const f = new NUMBER;

	it('has number datatype', () => {
		assert.strictEqual(NUMBER.dataType(), DataType.NUMBER);
	});

	it('array of numbers is NULL', () => {
		assert.strictEqual(f.call([[1, 2]]), null);
	});

	it('object is NULL', () => {
		assert.strictEqual(f.call([{"1": 2}]), null);
	});

	it('false is NULL', () => {
		assert.strictEqual(f.call([false]), null);
	});

	it('true is NULL', () => {
		assert.strictEqual(f.call([true]), null);
	});

	it('nulls in NULL', () => {
		assert.strictEqual(f.call([null]), null);
	});

	it('number strings', () => {
		assert.strictEqual(f.call(["123"]), 123);
		assert.strictEqual(f.call(["-123"]), -123);
		assert.strictEqual(f.call(["0123"]), 123);
	});

	it('invalid strings is NULL', () => {
		assert.strictEqual(f.call(["hello"]), null);
	});

	it('numbers', () => {
		assert.strictEqual(f.call([123]), 123);
	});
});
