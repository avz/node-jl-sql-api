const AggregationFunction = require('../../AggregationFunction');

class SUM extends AggregationFunction
{
	constructor()
	{
		super();

		this.sum = 0;
	}

	init()
	{
	}

	update(args)
	{
		this.sum += parseFloat(args[0]);
	}

	result()
	{
		return this.sum;
	}

	deinit()
	{
		this.sum = 0;
	}
}

module.exports = SUM;
