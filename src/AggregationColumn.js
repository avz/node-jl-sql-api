const SqlNodes = require('./sql/Nodes');
const BasicColumn = require('./BasicColumn');
const AggregationFunction = require('./AggregationFunction');

class AggregationColumn extends BasicColumn
{
	constructor(preparingContext, alias, expression)
	{
		super(preparingContext, alias, expression);

		this.aggregationCalls = [];

		const sqlToJs = preparingContext.sqlToJs;

		const nodes = expression.childNodesRecursive().concat([expression]);

		for (let node of nodes) {
			if (!(node instanceof SqlNodes.Call)) {
				continue;
			}

			const func = preparingContext.functionsMap.need(node.function.fragments);
			if (!(func.prototype instanceof AggregationFunction)) {
				continue;
			}

			this.aggregationCalls.push({
				node: node,
				func: func,
				args: node.args.map(sqlToJs.nodeToFunction.bind(sqlToJs))
			});
		}

		this.result = () => sqlToJs.nodeToFunction(expression)({});
	}

	valueSource()
	{
		throw new Error('Not allowed for aggregation columns');
	}
}

module.exports = AggregationColumn;
