'use strict';

const assert = require('assert');
const Quoter = require('../../src/Quoter');

describe('Quoter', () => {
	describe('unquote()', () => {
		for (const quoteCharacter of ["'", '"', '`']) {
			it('quote character = [' + quoteCharacter + ']', () => {
				const q = (string) => {
					return quoteCharacter + string + quoteCharacter;
				};

				assert.strictEqual(Quoter.unquote(q('')), '');
				assert.strictEqual(Quoter.unquote(q('hello')), 'hello');
				assert.strictEqual(Quoter.unquote(q('hello\\tworld')), 'hello\tworld');
			});
		}
	});

	describe('unquoteOptionalQuotes', () => {
		it('quoted string', () => {
			assert.strictEqual(Quoter.unquoteOptionalQuotes('""', '"'), '');
			assert.strictEqual(Quoter.unquoteOptionalQuotes('"hello"', '"'), 'hello');
			assert.strictEqual(Quoter.unquoteOptionalQuotes('\'hello\'', '\''), 'hello');
			assert.strictEqual(Quoter.unquoteOptionalQuotes('`hello`', '`'), 'hello');
		});

		it('unquoted string', () => {
			assert.strictEqual(Quoter.unquoteOptionalQuotes('', '"'), '');
			assert.strictEqual(Quoter.unquoteOptionalQuotes('hello', '"'), 'hello');
			assert.strictEqual(Quoter.unquoteOptionalQuotes('hello', '\''), 'hello');
		});

		it('quoted by wrong quotes', () => {
			assert.strictEqual(Quoter.unquoteOptionalQuotes('\'hello\'', '"'), '\'hello\'');
			assert.strictEqual(Quoter.unquoteOptionalQuotes('"hello"', '\''), '"hello"');
		});
	});

	describe('unescape()', () => {
		it('quotes', () => {
			assert.strictEqual(Quoter.unescape('\\"'), '"');
			assert.strictEqual(Quoter.unescape('\\\''), '\'');
			assert.strictEqual(Quoter.unescape('\\`'), '`');
		});

		it('special characters', () => {
			assert.strictEqual(Quoter.unescape('line1\\nline2'), 'line1\nline2');
			assert.strictEqual(Quoter.unescape('col\\tcol'), 'col\tcol');
		});

		it('quote character at last position', () => {
			assert.throws(() => {
				Quoter.unescape('hello\\');
			}, Error, 'Unexpected end of string after');
		});
	});
});
