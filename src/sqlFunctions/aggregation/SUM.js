'use strict';

const AggregationFunctionSync = require('../../AggregationFunctionSync');
const DataType = require('../../DataType');

class SUM extends AggregationFunctionSync
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	init()
	{
		this.sum = 0;
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
