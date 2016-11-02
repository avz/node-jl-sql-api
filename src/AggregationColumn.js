const SqlNodes = require('./sql/Nodes');
const BasicColumn = require('./BasicColumn');
const AggregationFunction = require('./AggregationFunction');
const AggregationCall = require('./AggregationCall');

class AggregationColumn extends BasicColumn
{
	constructor(preparingContext, alias, expression)
	{
		super(preparingContext, alias, expression);

		this.aggregationCalls = this.createAggregationCalls();

		this.result = () => preparingContext.sqlToJs.nodeToFunction(expression)({});
	}

	createAggregationCalls()
	{
		const calls = [];
		const sqlToJs = this.preparingContext.sqlToJs;

		const nodes = this.expression.childNodesRecursive().concat([this.expression]);

		for (let node of nodes) {
			if (!(node instanceof SqlNodes.Call)) {
				continue;
			}

			const func = this.preparingContext.functionsMap.need(node.function.fragments);
			if (!(func.prototype instanceof AggregationFunction)) {
				continue;
			}

			calls.push(new AggregationCall(sqlToJs, node, func));
		}

		return calls;
	}

	valueSource()
	{
		throw new Error('Not allowed for aggregation columns');
	}
}

module.exports = AggregationColumn;
