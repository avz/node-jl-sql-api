'use strict';

const AggregationFunction = require('./AggregationFunction');
const ImplementationRequired = require('./error/ImplementationRequired');

class AggregationFunctionAsync extends AggregationFunction
{
	/**
	 * Run once per each row
	 * @param {Array} args
	 * @returns {undefined}
	 */
	updateAsync(args)
	{
		throw new ImplementationRequired;
	}
}

module.exports = AggregationFunctionAsync;
