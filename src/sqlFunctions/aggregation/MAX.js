'use strict';

const AggregationFunctionSync = require('../../AggregationFunctionSync');
const DataType = require('../../DataType');

class MIN extends AggregationFunctionSync
{
	constructor()
	{
		super();

		this.max = null;
	}

	static dataType()
	{
		return DataType.MIXED;
	}

	init()
	{
		this.max = null;
	}

	updateSync(args)
	{
		if (args[0] === undefined || args[0] === null) {
			return;
		}

		if (this.max === null) {
			this.max = args[0];
		} else {
			this.max = args[0] > this.max ? args[0] : this.max;
		}
	}

	resultSync()
	{
		return this.max;
	}

	deinit()
	{
		this.max = null;
	}
}

module.exports = MIN;
