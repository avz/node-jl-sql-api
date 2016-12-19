'use strict';

const AggregationFunctionSync = require('../../AggregationFunctionSync');
const DataType = require('../../DataType');

class SUM extends AggregationFunctionSync
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

	updateSync(args)
	{
		const v = parseFloat(args[0]);

		if (isNaN(v)) {
			return;
		}

		this.sum += v;
	}

	resultSync()
	{
		return this.sum;
	}

	deinit()
	{
		this.sum = 0;
	}
}

module.exports = SUM;
