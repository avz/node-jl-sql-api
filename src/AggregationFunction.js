const ImplementationRequired = require('./error/ImplementationRequired');

/**
 * Methods execution sequence:
 *	- constructor()
 *	- Per each group
 *		- init()
 *		- result() - see below
 *		- Per each row
 *			- update()
 *			- result() - see below
 *		- result()
 *		- deinit()
 *
 *	Method result() can be called at any time after init() to monitor realtime
 *	progress, it can be also useful for debug purposes
 *
 */
class AggregationFunction
{
	/**
	 * Run once during SQL query parsing
	 * @returns {AggregationFunction}
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
	 * Run once per each row
	 * @param {Array} args
	 * @returns {undefined}
	 */
	update(args)
	{
		throw new ImplementationRequired;
	}

	/**
	 * Get current result. Can be call multiple times per group
	 * @returns {any}
	 */
	result()
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
