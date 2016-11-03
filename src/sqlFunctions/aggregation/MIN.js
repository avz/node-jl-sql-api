const AggregationFunction = require('../../AggregationFunction');

class MIN extends AggregationFunction
{
	constructor()
	{
		super();

		this.min = null;
	}

	init()
	{
	}

	update(args)
	{
		if (args[0] === undefined || args[0] === null) {
			return;
		}

		if (this.min === null) {
			this.min = args[0]
		} else {
			this.min = args[0] < this.min ? args[0] : this.min;
		}
	}

	result()
	{
		return this.min;
	}

	deinit()
	{
		this.min = null;
	}
}

module.exports = MIN;
