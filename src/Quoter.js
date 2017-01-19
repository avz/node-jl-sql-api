'use strict';

class Quoter
{
	/**
	 *
	 * @param {string} string
	 * @returns {string}
	 */
	static unquote(string)
	{
		const stringWoQuotes = string.substr(1, string.length - 2);

		return Quoter.unescape(stringWoQuotes);
	}

	/**
	 *
	 * @param {string} string
	 * @param {string} quoteCharacter
	 * @returns {string}
	 */
	static unquoteOptionalQuotes(string, quoteCharacter)
	{
		if (!string.length) {
			return '';
		}

		let stringWoQuotes;

		if (string[0] === quoteCharacter) {
			stringWoQuotes = string.substr(1, string.length - 2);
		} else {
			stringWoQuotes = string;
		}

		return Quoter.unescape(stringWoQuotes);
	}

	/**
	 *
	 * @param {string} string
	 * @param {object} customEscapes
	 * @returns {string}
	 */
	static unescape(string, customEscapes = {})
	{
		/**
		 * @see http://dev.mysql.com/doc/refman/5.7/en/string-literals.html Table 10.1
		 */
		const specialChars = {
			'n': '\n',
			't': '\t',
			'r': '\r',
			'0': '\0',   // An ASCII NUL (X'00') character
			'b': '\b',   // A backspace character
			'Z': '\x1a', //	ASCII 26 (Control+Z)
			'%': '\\%',  // For LIKE
			'_': '\\_'   // For LIKE
		};

		for (const char in customEscapes) {
			specialChars[char] = customEscapes[char];
		}

		let unescapedString = '';
		let charIsEscaped = false;

		var position = -1;

		for (const char of string) {
			position++;

			if (charIsEscaped) {
				if (char in specialChars) {
					if (specialChars[char] instanceof Function) {
						unescapedString += specialChars[char](char, position - 1);
					} else {
						unescapedString += specialChars[char];
					}
				} else {
					unescapedString += char;
				}

				charIsEscaped = false;
				continue;
			}

			if (char === Quoter.escapeCharacter) {
				charIsEscaped = true;
				continue;
			}

			unescapedString += char;
		}

		if (charIsEscaped) {
			throw new Error('Unexpected end of string after "\\": ' + string);
		}

		return unescapedString;
	}
}

Quoter.escapeCharacter = '\\';

module.exports = Quoter;
