'use strict';

class AggregationCallRuntime
{
	constructor(aggregationCall)
	{
		this.call = aggregationCall;
		this.instance = new aggregationCall.func;
	}

	update(row)
	{
		this.instance.update(this.call.args.map(cb => cb(row)));
	}

	result()
	{
		return this.instance.result();
	}
}

module.exports = AggregationCallRuntime;
