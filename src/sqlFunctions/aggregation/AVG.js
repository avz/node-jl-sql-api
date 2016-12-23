'use strict';

const AggregationFunctionSync = require('../../AggregationFunctionSync');
const DataType = require('../../DataType');

class AVG extends AggregationFunctionSync
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	init()
	{
		this.sum = 0;
		this.count = 0;
	}

	updateSync(args)
	{
		const v = parseFloat(args[0]);

		if (isNaN(v)) {
			return;
		}

		this.sum += v;
		this.count++;
	}

	resultSync()
	{
		return this.count ? this.sum / this.count : null;
	}

	deinit()
	{
		this.sum = 0;
		this.count = 0;
	}
}

module.exports = AVG;
