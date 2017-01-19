'use strict';

const SqlToJsDateHelper = require('./SqlToJsDateHelper');
const SqlToJsOperatorsHelper = require('./SqlToJsOperatorsHelper');

class SqlToJsHelpers
{
	/**
	 *
	 * @param {SqlToJs} sqlToJs
	 * @returns {SqlToJsHelpers}
	 */
	constructor(sqlToJs)
	{
		this.date = new SqlToJsDateHelper(sqlToJs);
		this.operators = new SqlToJsOperatorsHelper(sqlToJs);
	}
}

module.exports = SqlToJsHelpers;
