'use strict';

const SqlNodes = require('./sql/Nodes');
const BasicExpression = require('./BasicExpression');
const AggregationFunction = require('./AggregationFunction');
const AggregationCall = require('./AggregationCall');
const SqlLogicError = require('./error/SqlLogicError');
const ExpressionAnalyser = require('./ExpressionAnalyser');

class AggregationExpression extends BasicExpression
{
	/**
	 *
	 * @param {PreparingContext} preparingContext
	 * @param {Node} expression
	 * @returns {AggregationExpression}
	 */
	constructor(preparingContext, expression)
	{
		super(preparingContext, expression);

		this.expressionAnalyser = new ExpressionAnalyser(preparingContext);
		this.aggregationCalls = this.createAggregationCalls();

		this.result = preparingContext.sqlToJs.nodeToFunction(expression);
	}

	/**
	 *
	 * @returns {AggregationCall[]}
	 */
	createAggregationCalls()
	{
		const calls = [];
		const sqlToJs = this.preparingContext.sqlToJs;

		const nodes = this.expression.childNodesRecursive().concat([this.expression]);

		for (const node of nodes) {
			if (!(node instanceof SqlNodes.Call)) {
				continue;
			}

			const func = this.preparingContext.functionsMap.need(node.function.getFragments());

			if (!(func.prototype instanceof AggregationFunction)) {
				continue;
			}

			for (const arg of node.args.values) {
				if (this.expressionAnalyser.isAggregationExpression(arg)) {
					throw new SqlLogicError('Nested aggregation function is not alowed');
				}
			}

			calls.push(new AggregationCall(sqlToJs, node, func));
		}

		return calls;
	}

	valueSource()
	{
		throw new SqlLogicError('Not allowed for aggregation columns');
	}
}

module.exports = AggregationExpression;
