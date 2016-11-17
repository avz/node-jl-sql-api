'use strict';

const assert = require('assert');
const FunctionMap = require('../../src/FunctionsMap');

describe('FunctionMap::add', () => {
	it('just add', () => {
		const map = new FunctionMap;

		map.add(['hello', 'world'], 'fake');
		assert.strictEqual(map.get(['hello', 'world']), 'fake');

		map.add(['hello'], 'fake2');
		assert.strictEqual(map.get(['hello']), 'fake2');
	});

	it('error on duplicate', () => {
		const map = new FunctionMap;

		map.add(['hello', 'world'], 'fake');

		assert.throws(() => {
			map.add(['hello', 'world'], 'fake2');
		}, 'Function already exists: hello.world');

		assert.throws(() => {
			map.add(['heLLo', 'world'], 'fake2');
		}, 'Function already exists: heLLo.world');
	});
});

describe('FunctionMap::get', () => {
	it('found', () => {
		const map = new FunctionMap;

		map.add(['hello'], 'hi');

		assert.strictEqual(map.need(['hello']), 'hi');
	});

	it('not found', () => {
		const map = new FunctionMap;

		assert.strictEqual(map.get(['nonexistent']), undefined);
	});

	it('case insensitivity', () => {
		const map = new FunctionMap;

		map.add(['hello', 'world'], 'fake');

		assert.strictEqual(map.get(['HELLO', 'WORLD']), 'fake');
	});
});

describe('FunctionMap::need', () => {
	it('found', () => {
		const map = new FunctionMap;

		map.add(['hello'], 'hi');

		assert.strictEqual(map.need(['hello']), 'hi');
	});

	it('not found', () => {
		const map = new FunctionMap;

		assert.throws(() => {
			map.need(['hello']);
		}, 'Function not found: hello');
	});

});
