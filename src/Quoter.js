'use strict';

class Quoter
{
	static quote(string, quoteCharacter)
	{

	}

	static unquote(string)
	{
		const specialChars = {
			n: '\n',
			t: '\t'
		};

		const stringWoQuotes = string.substr(1, string.length - 2);

		let unquotedString = '';
		let charIsEscaped = false;

		for (const char of stringWoQuotes) {
			if (charIsEscaped) {
				if (char in specialChars) {
					unquotedString += specialChars[char];
				} else {
					unquotedString += char;
				}

				charIsEscaped = false;
				continue;
			}

			if (char === Quoter.escapeCharacter) {
				charIsEscaped = true;
				continue;
			}

			unquotedString += char;
		}

		if (charIsEscaped) {
			throw new Error('Unexpected end of string after "\\": ' + string);
		}

		return unquotedString;
	}
}

Quoter.escapeCharacter = '\\';

module.exports = Quoter;
