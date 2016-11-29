'use strict';

const assert = require('assert');
const NodeString = require('../../../../src/sql/nodes/String');

describe('sql/nodes/String', () => {
	describe('escaping', () => {
		it('single quotes', () => {
			assert.strictEqual((new NodeString("'hello'")).value, 'hello');
			assert.strictEqual((new NodeString("'hel\\nlo'")).value, 'hel\nlo');
		});

		it('double quotes', () => {
			assert.strictEqual((new NodeString('"hello"')).value, 'hello');
			assert.strictEqual((new NodeString('"hel\\nlo"')).value, 'hel\nlo');
		});
	});

	it('clone', () => {
		const orig = new NodeString('"text"');
		const clone = orig.clone();

		assert.ok(clone instanceof NodeString);
		assert.notStrictEqual(clone, orig);
		assert.notStrictEqual(clone.id, orig.id);
		assert.strictEqual(clone.value, orig.value);
	});
});
