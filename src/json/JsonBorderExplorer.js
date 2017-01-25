'use strict';

/**
 * Ugly, write-only but fast implementation of stream JSON separating parser
 */
class JsonBorderExplorer
{
	constructor()
	{
		this.stack = [];

		this.nextCharEscaped = false;

		this.buf = null;
		this.off = null;

		this.pushedEarnedValue = null;

		this.objectState = null;
		this.arrayState = null;

		this.earningInProgress = false;
		this.keywordRemaining = 0;
	}

	write(buf, off)
	{
		this.buf = buf;
		this.off = off;

		while (this.off < this.buf.length) {
			if (this.stack.length) {
				this.earningInProgress = true;
			}

			if (this.earnValue(true) !== null) {
				if (!this.stack.length) {
					this.buf = null; // just free link

					return this.off;
				}
			}
		}

		return -1;
	}

	end()
	{
		if (this.stack.length) {
			if (this.stack.length === 1 && this.stack[0] === JsonBorderExplorer.TYPE_NUMBER) {
				/*
				 * number - единственный тип, конец которого детектится только
				 * наличием следующего символа, поэтому если number в конце,
				 * то его нужно детектить явно
				 */
				return this.off;
			}

			throw new Error('Unexpected end of JSON, expected ending of: ' + this.stack.join(', '));
		}

		return -1;
	}

	earnType()
	{
		var chr = this.buf[this.off];

		this.off++;

		/* eslint-disable indent, no-unreachable */
		switch (chr) {
			case 0x22: // '"'
				return JsonBorderExplorer.TYPE_STRING;
			break;
			case 0x7b: // '{'
				this.objectState = null;

				return JsonBorderExplorer.TYPE_OBJECT;
			break;
			case 0x5b: // '['
				this.arrayState = null;

				return JsonBorderExplorer.TYPE_ARRAY;
			break;
			case 0x6e: // 'n'
				this.keywordRemaining = 3;

				return JsonBorderExplorer.TYPE_NULL;
			break;
			case 0x74: // 't'
				this.keywordRemaining = 3;

				return JsonBorderExplorer.TYPE_TRUE;
			break;
			case 0x66: // 'f'
				this.keywordRemaining = 4;

				return JsonBorderExplorer.TYPE_FALSE;
			break;
			default:
				// numbers
				if ((chr >= 0x30 && chr <= 0x39) || chr === 0x2d) { // '0' - '9', '-'
					return JsonBorderExplorer.TYPE_NUMBER;
				}
		}
		/* eslint-enable indent, no-unreachable */

		throw new Error("Unexpected character: " + String.fromCharCode(chr));
	}

	earnValue(ignoreStackedValue = false)
	{
		if (!ignoreStackedValue && this.pushedEarnedValue !== null) {
			const v = this.pushedEarnedValue;

			this.pushedEarnedValue = null;

			return v;
		}

		var type = null;
		var stacked = this.earningInProgress;
		var stackSize = this.stack.length;

		if (this.earningInProgress) {
			type = this.stack[this.stack.length - 1];
		} else {
			if (!this.earnSpaces()) {
				return null;
			}

			this.earningInProgress = true;
			type = this.earnType();
		}

		var r = null;

		/* eslint-disable indent, no-unreachable, no-fallthrough */
		switch (type) {
			case JsonBorderExplorer.TYPE_STRING:
				r = this.earnString();
			break;
			case JsonBorderExplorer.TYPE_TRUE:
			case JsonBorderExplorer.TYPE_FALSE:
			case JsonBorderExplorer.TYPE_NULL:
				r = this.earnKeyword();
			break;
			case JsonBorderExplorer.TYPE_NUMBER:
				r = this.earnNumber();
			break;
			case JsonBorderExplorer.TYPE_OBJECT:
				r = this.earnObject();

				if (r !== null) {
					/*
					* восстанавливаем правильное состояние для родительского
					* объекта выше по дереву
					*/
					this.objectState = 'valueReading';
				}
			break;
			case JsonBorderExplorer.TYPE_ARRAY:
				r = this.earnArray();

				if (r !== null) {
					/*
					* восстанавливаем правильное состояние для родительского
					* объекта выше по дереву
					*/
					this.arrayState = 'valueReading';
				}
			break;
			default:
				throw new Error('Unknown type: ' + type);
		}
		/* eslint-enable indent, no-unreachable, no-fallthrough */

		if (r !== null) {
			this.pushedEarnedValue = r;
			this.earningInProgress = false;

			if (stacked) {
				this.stack.pop();
			}
		} else if (!stacked) {
			// значение не дочитали до конца - сохраним в стек, чтобы дочитать
			this.stack.splice(stackSize, 0, type);
		}

		return r;
	}

	earnString()
	{
		for (; this.off < this.buf.length; this.off++) {
			if (this.nextCharEscaped) {
				this.nextCharEscaped = false;
				continue;
			}

			var chr = this.buf[this.off];

			if (chr === 0x22) { // '"'
				this.off++;

				return true;
			}

			if (chr === 0x5c) { // '\'
				this.nextCharEscaped = true;
			}
		}

		return null;
	}

	earnKeyword()
	{
		if (this.buf.length - this.off >= this.keywordRemaining) {
			this.off += this.keywordRemaining;

			return true;
		}

		this.keywordRemaining -= this.buf.length - this.off;

		this.off = this.buf.length;

		return null;
	}

	earnNumber()
	{
		for (; this.off < this.buf.length; this.off++) {
			const chr = this.buf[this.off];

			if (!((chr >= 0x30 && chr <= 0x39) || chr === 0x2d || chr === 0x2b || chr === 0x2e || chr === 0x45 || chr === 0x65)) { // '0' - '9', '-', 'E', 'e'
				return true;
			}
		}

		return null;
	}

	earnObject()
	{
		while (this.off < this.buf.length) {
			/* eslint-disable indent, no-unreachable, no-fallthrough */
			switch (this.objectState) {
				case null:
					if (!this.earnSpaces()) {
						return null;
					}

					if (this.buf[this.off] !== 0x22) { // '"'
						if (this.buf[this.off] === 0x7d) { // '}'
							this.off++;

							return true;
						}

						throw new Error('Object key expected');
					}

					this.off++;

				case 'keyReading':
					if (this.earnString() === null) {
						this.objectState = 'keyReading';

						return null;
					}

				case 'colonReading':
					if (!this.earnSpaces()) {
						this.objectState = 'colonReading';

						return null;
					}

					if (this.buf[this.off] !== 0x3a) { // ':'
						throw new Error('Colon expected after object key');
					}

					this.off++;

				case 'beforeValue':
					if (!this.earnSpaces()) {
						this.objectState = 'beforeValue';

						return null;
					}

					this.earningInProgress = false;
					this.pushedEarnedValue = null;

				case 'valueReading':
					/*
					 * состояние здесь унжно установить сразу т.к. оно может
					 * меняться неявно
					 */
					this.objectState = 'valueReading';

					if (this.earnValue() === null) {
						return null;
					}
				case 'commaOrEndReading':
					if (!this.earnSpaces()) {
						this.objectState = 'commaOrEndReading';

						return null;
					}

					if (this.buf[this.off] === 0x2c) { // ','
						this.objectState = null;
						this.off++;

					} else if (this.buf[this.off] === 0x7d) { // '}'
						this.off++;

						return true;
					} else {
						throw new Error('Comma or end of object expected');
					}
				break;
				default:
					throw new Error('Wrong state: ' + this.objectState);
			}
			/* eslint-enable indent, no-unreachable, no-fallthrough */
		}

		return null;
	}

	earnArray()
	{
		while (this.off < this.buf.length) {
			/* eslint-disable indent, no-unreachable, no-fallthrough */
			switch (this.arrayState) {
				case null:
					if (!this.earnSpaces()) {
						return null;
					}

					if (this.buf[this.off] === 0x5d) { // ']'
						this.off++;

						return true;
					}
				case 'beforeValue':
					this.earningInProgress = false;
					this.pushedEarnedValue = null;
				case 'valueReading':
					this.arrayState = 'valueReading';

					if (this.earnValue() === null) {
						return null;
					}
				case 'commaOrEndReading':
					if (!this.earnSpaces()) {
						this.arrayState = 'commaOrEndReading';

						return null;
					}

					if (this.buf[this.off] === 0x2c) { // ','
						this.arrayState = null;
						this.off++;

					} else if (this.buf[this.off] === 0x5d) { // ']'
						this.off++;

						return true;
					} else {
						throw new Error('Comma or end of array expected');
					}

				break;
				default:
					throw new Error('Wrong state: ' + this.arrayState);
			}
			/* eslint-enable indent, no-unreachable, no-fallthrough */
		}

		return null;
	}

	earnSpaces()
	{
		for (; this.off < this.buf.length; this.off++) {
			const chr = this.buf[this.off];

			if (!(chr === 0x20 || chr === 0x09 || chr === 0x0a || chr === 0x0d)) {
				return true;
			}
		}

		return null;
	}
}

JsonBorderExplorer.TYPE_STRING = 'string';
JsonBorderExplorer.TYPE_NUMBER = 'number';
JsonBorderExplorer.TYPE_TRUE = 'true';
JsonBorderExplorer.TYPE_FALSE = 'false';
JsonBorderExplorer.TYPE_NULL = 'null';
JsonBorderExplorer.TYPE_OBJECT = 'object';
JsonBorderExplorer.TYPE_ARRAY = 'array';

module.exports = JsonBorderExplorer;
