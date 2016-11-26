'use strict';

const assert = require('assert');
const Quoter = require('../../src/Quoter');

describe('Quoter', () => {
	describe('unquote()', () => {
		for (const quoteCharacter of ["'", '"', '`']) {
			describe('quote character = [' + quoteCharacter + ']', () => {
				const q = (string) => {
					return quoteCharacter + string + quoteCharacter;
				};

				it('quotes', () => {
					assert.strictEqual(Quoter.unquote(q('\\"')), '"');
					assert.strictEqual(Quoter.unquote(q('\\\'')), '\'');
					assert.strictEqual(Quoter.unquote(q('\\`')), '`');
				});

				it('special characters', () => {
					assert.strictEqual(Quoter.unquote(q('line1\\nline2')), 'line1\nline2');
					assert.strictEqual(Quoter.unquote(q('col\\tcol')), 'col\tcol');
				});

				it('quote character at last position', () => {
					assert.throws(() => {
						Quoter.unquote(q('hello\\'));
					}, Error, 'Unexpected end of string after');
				});
			});
		}
	});
});
