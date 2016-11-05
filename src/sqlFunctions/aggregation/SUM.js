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
		const v = parseFloat(args[0]);
		if (isNaN(v)) {
			return;
		}

		this.sum += v;
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