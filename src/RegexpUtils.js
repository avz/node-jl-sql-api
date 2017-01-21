'use strict';

const RegexpInfo = require('./RegexpInfo');
const RegexpSyntaxError = require('./error/RegexpSyntaxError');

class RegexpUtils
{
	/**
	 * Method to avoid v8 RegExp bug in node v6
	 *
	 * @param {string} string
	 * @returns {RegexpInfo}
	 */
	static parseRegexp(string)
	{
		const m = string.match(/^\/((?:\\.|[^\\/])*)\/([a-z]*)$/i);

		if (!m) {
			throw new RegexpSyntaxError(string);
		}

		let source = m[1];
		const flags = m[2];

		if (source === '') {
			// avoid comment-like regex `//`
			source = '(?:)';
		}

		try {
			const regexp = new RegExp(source, flags);

			return new RegexpInfo(source, flags, regexp);
		} catch (e) {
			throw new RegexpSyntaxError(e.message + ': ' + string);
		}
	}
}

module.exports = RegexpUtils;
