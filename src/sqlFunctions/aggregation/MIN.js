'use strict';

const AggregationFunctionSync = require('../../AggregationFunctionSync');
const DataType = require('../../DataType');

class MIN extends AggregationFunctionSync
{
	static dataType()
	{
		return DataType.MIXED;
	}

	init()
	{
		this.min = null;
	}

	updateSync(args)
	{
		if (args[0] === undefined || args[0] === null) {
			return;
		}

		if (this.min === null) {
			this.min = args[0];
		} else {
			this.min = args[0] < this.min ? args[0] : this.min;
		}
	}

	resultSync()
	{
		return this.min;
	}

	deinit()
	{
		this.min = null;
	}
}

module.exports = MIN;
