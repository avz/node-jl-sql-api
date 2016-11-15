const BasicExpression = require('./BasicExpression');

class BasicColumn extends BasicExpression
{
	constructor(preparingContext, alias, expression)
	{
		super(preparingContext, expression);

		this.alias = alias;
	}
}

module.exports = BasicColumn;
