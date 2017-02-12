'use strict';

const BasicExpression = require('./BasicExpression');

class BasicColumn extends BasicExpression
{
	/**
	 *
	 * @param {PreparingContext} preparingContext
	 * @param {string[]} alias
	 * @param {Node} expression
	 * @param {boolean} isUserDefinedAlias
	 * @returns {BasicColumn}
	 */
	constructor(preparingContext, alias, expression, isUserDefinedAlias)
	{
		super(preparingContext, expression);

		this.alias = alias;
		this.isUserDefinedAlias = isUserDefinedAlias;
	}
}

module.exports = BasicColumn;
