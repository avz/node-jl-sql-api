class AggregationCall
{
	constructor(sqlToJs, node, func)
	{
		this.node = node;
		this.func = func;
		this.args = node.args.map(sqlToJs.nodeToFunction.bind(sqlToJs));
	}
}

module.exports = AggregationCall;
