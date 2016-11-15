const AggregationExpression = require('./AggregationExpression');

class AggregationColumn extends AggregationExpression
{
	constructor(preparingContext, alias, expression)
	{
		super(preparingContext, expression);

		this.alias = alias;
	}
}

module.exports = AggregationColumn;
