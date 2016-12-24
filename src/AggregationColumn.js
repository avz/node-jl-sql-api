'use strict';

const AggregationExpression = require('./AggregationExpression');

class AggregationColumn extends AggregationExpression
{
	/**
	 * @param {PreparingContext} preparingContext
	 * @param {string[]} alias
	 * @param {Node} expression
	 * @returns {AggregationColumn}
	 */
	constructor(preparingContext, alias, expression)
	{
		super(preparingContext, expression);

		this.alias = alias;
	}
}

module.exports = AggregationColumn;
