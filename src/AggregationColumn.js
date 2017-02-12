'use strict';

const AggregationExpression = require('./AggregationExpression');

class AggregationColumn extends AggregationExpression
{
	/**
	 * @param {PreparingContext} preparingContext
	 * @param {string[]} alias
	 * @param {Node} expression
	 * @param {boolean} isUserDefinedAlias
	 * @returns {AggregationColumn}
	 */
	constructor(preparingContext, alias, expression, isUserDefinedAlias)
	{
		super(preparingContext, expression);

		this.alias = alias;
		this.isUserDefinedAlias = isUserDefinedAlias;
	}
}

module.exports = AggregationColumn;
