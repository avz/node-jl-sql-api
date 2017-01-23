'use strict';

const Quoter = require('./Quoter');
const RegexpUtils = require('./RegexpUtils');

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

	/**
	 * Этот метод используется только для динамических REGEXP
	 * @param {string} regexpString
	 * @param {string} value
	 * @returns {boolean}
	 */
	regexp(regexpString, value)
	{
		return RegexpUtils.parseRegexp(regexpString).regexp.test(value);
	}

	/**
	 * @param {mixed} value
	 * @param {mixed} rangeStart
	 * @param {mixed} rangeEnd
	 * @returns {Boolean}
	 */
	between(value, rangeStart, rangeEnd)
	{
		return value >= rangeStart && value <= rangeEnd;
	}

	is(value, expected)
	{
		/* eslint-disable indent, no-unreachable */
		switch (expected) {
			case 'array':
				return value instanceof Array;
			break;
			case 'object':
				return value !== null && typeof(value) === 'object' && !(value instanceof Array);
			break;
			case 'string':
				return typeof(value) === 'string';
			break;
			case 'number':
				return typeof(value) === 'number';
			break;
			case 'bool':
				return typeof(value) === 'boolean';
			break;
			case 'null':
				return value === null;
			break;
			default:
				throw new Error('Unknown expected type: ' + expected);
		}
		/* eslint-enable indent, no-unreachable */
	}
}

module.exports = SqlToJsOperatorsHelper;
