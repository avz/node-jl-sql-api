'use strict';

const Quoter = require('./Quoter');

class SqlToJsOperatorsHelper
{
	/**
	 *
	 * @param {Array} haystack
	 * @param {mixed} needle
	 * @returns {Boolean}
	 */
	unstrictIn(haystack, needle)
	{
		/* eslint-disable eqeqeq */
		for (const v of haystack) {
			if (v == needle) {
				return true;
			}
		}
		/* eslint-enable eqeqeq */

		return false;
	}

	_regexEscapeString(string)
	{
		/**
		 * @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Regular_Expressions
		 */
		return string.replace(/[/.*+?^${}()|[\]\\]/g, '\\$&');
	}

	likeCompileRegexBaseString(likeString)
	{
		/*
		 * У LIKE в MySQL мягко говоря станная логика экранирования
		 * @see http://dev.mysql.com/doc/refman/5.7/en/string-comparison-functions.html#operator_like
		 */
		var regex = '';
		var lastPos = 0;

		const nextRegexSegment = (chr, position) => {
			const seg = likeString.substr(lastPos, position);
			const regexSeg = this._regexEscapeString(seg).replace(/%/g, '[\\s\\S]*').replace(/_/g, '[\\s\\S]') + chr;

			lastPos = position + 2;

			regex += regexSeg;

			return ''; // результат тут не важен
		};

		const quoting = {
			'%': nextRegexSegment,
			'_': nextRegexSegment
		};

		Quoter.unescape(likeString, quoting);

		nextRegexSegment('', likeString.length);

		return '^' + regex + '$';
	}

	likeCompileRegexString(likeString, caseSensitive)
	{
		const regex = this.likeCompileRegexBaseString(likeString);

		return '/' + regex + '/' + (caseSensitive ? '' : 'i');
	}

	likeCompileRegex(likeString, caseSensitive)
	{
		const regex = this.likeCompileRegexBaseString(likeString);

		return new RegExp(regex, caseSensitive ? '' : 'i');
	}

	like(likeString, caseSensitive, value)
	{
		const re = this.likeCompileRegex(likeString, caseSensitive);

		return re.test('' + value);
	}
}

module.exports = SqlToJsOperatorsHelper;
