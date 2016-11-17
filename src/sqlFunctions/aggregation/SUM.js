'use strict';

const AggregationFunction = require('../../AggregationFunction');
const DataType = require('../../DataType');

class SUM extends AggregationFunction
{
	constructor()
	{
		super();

		this.sum = 0;
	}

	static dataType()
	{
		return DataType.NUMBER;
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
