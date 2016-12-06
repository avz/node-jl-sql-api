'use strict';

const assert = require('assert');
const NodeIdent = require('../../../../src/sql/nodes/Ident');

describe('sql/nodes/Ident', () => {
	describe('escaping', () => {
		it('quotes', () => {
			assert.strictEqual((new NodeIdent("`hello`")).name, 'hello');
			assert.strictEqual((new NodeIdent("`hel\\nlo`")).name, 'hel\nlo');
			assert.strictEqual((new NodeIdent("`hel\\`lo`")).name, 'hel`lo');
		});

		it('no quotes', () => {
			assert.strictEqual((new NodeIdent("hello")).name, 'hello');
			assert.strictEqual((new NodeIdent("hel\\nlo")).name, 'hel\nlo');
			assert.strictEqual((new NodeIdent("hel\\`lo")).name, 'hel`lo');
		});
	});
});
