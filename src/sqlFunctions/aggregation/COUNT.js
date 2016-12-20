'use strict';

const AggregationFunctionSync = require('../../AggregationFunctionSync');
const DataType = require('../../DataType');

class COUNT extends AggregationFunctionSync
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	init()
	{
		this.count = 0;
	}

	updateSync(args)
	{
		if (!args.length) {
			this.count++;

			return;
		}

		if (args[0] === undefined || args[0] === null) {
			return;
		}

		this.count++;
	}

	resultSync()
	{
		return this.count;
	}

	deinit()
	{
		this.count = 0;
	}
}

module.exports = COUNT;
