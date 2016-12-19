'use strict';

const ImplementationRequired = require('./error/ImplementationRequired');

class AggregationFunction
{
	/**
	 * Run once during SQL query parsing
	 * @returns {AggregationFunctionSync}
	 */
	constructor()
	{
	}

	/**
	 * Run once per each group
	 * @returns {undefined}
	 */
	init()
	{
		throw new ImplementationRequired;
	}

	/**
	 * Run once per each group
	 * @returns {any}
	 */
	deinit()
	{
		throw new ImplementationRequired;
	}

	static dataType()
	{
		throw new ImplementationRequired;
	}
}

module.exports = AggregationFunction;
