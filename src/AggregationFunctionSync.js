'use strict';

const AggregationFunction = require('./AggregationFunction');
const ImplementationRequired = require('./error/ImplementationRequired');

class AggregationFunctionSync extends AggregationFunction
{
	/**
	 * Run once per each row
	 * @param {Array} args
	 * @returns {undefined}
	 */
	updateSync(args)
	{
		throw new ImplementationRequired;
	}

	/**
	 * Get current result. Can be call multiple times per group
	 * @returns {any}
	 */
	resultSync()
	{
		throw new ImplementationRequired;
	}
}

module.exports = AggregationFunctionSync;
