'use strict';

class AggregationCall
{
	/**
	 *
	 * @param {SqlToJs} sqlToJs
	 * @param {Node} node
	 * @param {AggregationFunction} func
	 * @returns {AggregationCall}
	 */
	constructor(sqlToJs, node, func)
	{
		this.node = node;
		this.func = func;
		this.args = node.args.values.map(sqlToJs.nodeToFunction.bind(sqlToJs));
	}
}

module.exports = AggregationCall;
