'use strict';

const AggregationFunctionSync = require('../../AggregationFunctionSync');
const DataType = require('../../DataType');

class COUNT extends AggregationFunctionSync
{
	constructor()
	{
		super();

		this.count = 0;
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
		if (!args.length) {
			this.count++;

			return;
		}

		if (args[0] === undefined || args[0] === null) {
			return;
		}

		this.count++;
	}

	result()
	{
		return this.count;
	}

	deinit()
	{
		this.count = 0;
	}
}

module.exports = COUNT;
