'use strict';

class AggregationCallRuntime
{
	constructor(aggregationCall)
	{
		this.call = aggregationCall;
		this.instance = new aggregationCall.func;
	}

	update(row, done)
	{
		if (this.instance.updateAsync) {
			this.instance.updateAsync(this.call.args.map(cb => cb(row)), done);
		} else {
			this.instance.updateSync(this.call.args.map(cb => cb(row)));
			done();
		}
	}

	result(done)
	{
		if (this.instance.resultAsync) {
			this.instance.resultAsync(done);
		} else {
			done(this.instance.resultSync());
		}
	}
}

module.exports = AggregationCallRuntime;
