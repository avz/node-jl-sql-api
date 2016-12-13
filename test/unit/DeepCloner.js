'use strict';

const assert = require('assert');
const DeepCloner = require('../../src/DeepCloner');

describe('Deep Clone', () => {
	it('scalars', () => {
		assert.strictEqual(DeepCloner.clone(10), 10);
		assert.strictEqual(DeepCloner.clone('hello'), 'hello');
		assert.strictEqual(DeepCloner.clone(true), true);
		assert.strictEqual(DeepCloner.clone(null), null);
		assert.strictEqual(DeepCloner.clone(undefined), undefined);
	});

	it('arrays', () => {
		const array = [1, {prop: 10}, 3];
		const copy = DeepCloner.clone(array);

		assert.strictEqual(copy[0], 1);
		assert.strictEqual(copy[1].prop, 10);
		assert.strictEqual(copy[2], 3);

		assert.notStrictEqual(copy, array);
		assert.notStrictEqual(copy[1], array[1]);
	});

	it('raw objects', () => {
		const o = {hello: 1, second: {prop: 10}};
		const copy = DeepCloner.clone(o);

		assert.strictEqual(o.hello, 1);
		assert.strictEqual(o.second.prop, 10);
		assert.notStrictEqual(copy, o);
		assert.notStrictEqual(copy.second, o.second);
	});

	it('Date', () => {
		const d = new Date('2016-12-13 01:02:03');
		const copy = DeepCloner.clone(d);

		assert.notStrictEqual(copy, d);
		assert.strictEqual(copy.valueOf(), d.valueOf());
	});
});
