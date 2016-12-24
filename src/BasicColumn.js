'use strict';

const BasicExpression = require('./BasicExpression');

class BasicColumn extends BasicExpression
{
	/**
	 *
	 * @param {PreparingContext} preparingContext
	 * @param {string[]} alias
	 * @param {Node} expression
	 * @returns {BasicColumn}
	 */
	constructor(preparingContext, alias, expression)
	{
		super(preparingContext, expression);

		this.alias = alias;
	}
}

module.exports = BasicColumn;
