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
	 * @returns {string}
	 */
	static unescape(string)
	{
		const specialChars = {
			n: '\n',
			t: '\t'
		};

		let unescapedString = '';
		let charIsEscaped = false;

		for (const char of string) {
			if (charIsEscaped) {
				if (char in specialChars) {
					unescapedString += specialChars[char];
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
