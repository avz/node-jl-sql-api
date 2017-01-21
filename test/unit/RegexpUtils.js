'use strict';

const assert = require('assert');
const RegexpUtils = require('../../src/RegexpUtils');
const RegexpSyntaxError = require('../../src/error/RegexpSyntaxError');

describe('RegexpUtils', () => {
	describe('parseRegexp()', () => {
		it('escaping', () => {
			assert.strictEqual(RegexpUtils.parseRegexp('/\\\\/').source, '\\\\');
			assert.strictEqual(RegexpUtils.parseRegexp('/\\\\\\//').source, '\\\\\\/');
			assert.strictEqual(RegexpUtils.parseRegexp('/hel\\/lo/').source, 'hel\\/lo');

			assert.throws(
				() => {
					RegexpUtils.parseRegexp('/\\/');
				},
				RegexpSyntaxError
			);
		});

		it('detect invalid expression', () => {
			assert.throws(
				() => {
					RegexpUtils.parseRegexp('///');
				},
				RegexpSyntaxError
			);

			assert.throws(
				() => {
					RegexpUtils.parseRegexp('/a/b/i');
				},
				RegexpSyntaxError
			);
		});

		it('empty regexp', () => {
			assert.strictEqual(RegexpUtils.parseRegexp('//').source, '(?:)');
		});

		it('flags', () => {
			assert.strictEqual(RegexpUtils.parseRegexp('/a/i').flags, 'i');
			assert.strictEqual(RegexpUtils.parseRegexp('/a/ig').flags, 'ig');
			assert.strictEqual(RegexpUtils.parseRegexp('/a/gi').flags, 'gi');
			assert.strictEqual(RegexpUtils.parseRegexp('/a/gim').flags, 'gim');
		});

		it('RegExp instance', () => {
			assert.ok(RegexpUtils.parseRegexp('/hello/').regexp instanceof RegExp);
			assert.strictEqual(RegexpUtils.parseRegexp('/hello/').regexp.source, 'hello');
			assert.strictEqual(RegexpUtils.parseRegexp('//ig').regexp.source, '(?:)');
			assert.strictEqual(RegexpUtils.parseRegexp('//ig').regexp.flags, 'gi');
		});
	});
});
