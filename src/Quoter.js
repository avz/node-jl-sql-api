'use strict';

class Quoter
{
	static quote(string, quoteCharacter)
	{

	}

	static unquote(string)
	{
		const stringWoQuotes = string.substr(1, string.length - 2);

		return Quoter.unescape(stringWoQuotes);
	}

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
