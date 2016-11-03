const AggregationFunction = require('../../AggregationFunction');

class MIN extends AggregationFunction
{
	constructor()
	{
		super();

		this.max = null;
	}

	init()
	{
	}

	update(args)
	{
		if (args[0] === undefined || args[0] === null) {
			return;
		}

		if (this.max === null) {
			this.max = args[0]
		} else {
			this.max = args[0] > this.max ? args[0] : this.max;
		}
	}

	result()
	{
		return this.max;
	}

	deinit()
	{
		this.max = null;
	}
}

module.exports = MIN;
