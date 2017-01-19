'use strict';

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
}

module.exports = SqlToJsOperatorsHelper;
