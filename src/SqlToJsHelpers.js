'use strict';

const SqlToJsDateHelper = require('./SqlToJsDateHelper');

class SqlToJsHelpers
{
	constructor(sqlToJs)
	{
		this.date = new SqlToJsDateHelper(sqlToJs);
	}

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

module.exports = SqlToJsHelpers;
