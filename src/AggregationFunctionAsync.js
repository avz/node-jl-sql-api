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

	/**
	 * Get current result. Can be call multiple times per group
	 * @param {Function} cb
	 * @returns {any}
	 */
	result(cb)
	{
		throw new ImplementationRequired;
	}
}

module.exports = AggregationFunctionAsync;
