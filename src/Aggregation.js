'use strict';

const BasicColumn = require('./BasicColumn');
const AggregationColumn = require('./AggregationColumn');
const AggregationExpression = require('./AggregationExpression');
const PropertiesPicker = require('./PropertiesPicker');
const AggregationCallRuntime = require('./AggregationCallRuntime');
const DataRow = require('./DataRow');

class Aggregation
{
	constructor(runtimeContext, expressions)
	{
		this.runtimeContext = runtimeContext;
		this.expressions = expressions;
		this.lastRow = null;

		this.aggregationCalls = [];

		const aggregations = this.runtimeContext[this.runtimeContext.aggregationsPropertyName];

		for (const expression of this.expressions) {
			if (!(expression instanceof AggregationExpression)) {
				continue;
			}

			for (const ac of expression.aggregationCalls) {
				const state = new AggregationCallRuntime(ac);

				this.aggregationCalls.push(state);

				aggregations[ac.node.id] = state.result.bind(state);
			}
		}

		const resultSetsMap = new Map;

		for (const expression of this.expressions) {
			if (expression instanceof AggregationColumn) {
				resultSetsMap.set(expression.alias, expression.result);
			} else if (expression instanceof BasicColumn) {
				resultSetsMap.set(expression.alias, expression.valueSource());
			}
		}

		this.propertiesPicker = new PropertiesPicker(resultSetsMap);
	}

	init()
	{
		for (const call of this.aggregationCalls) {
			call.instance.init();
		}
	}

	update(row)
	{
		for (const call of this.aggregationCalls) {
			call.update(row);
		}

		this.lastRow = row;
	}

	result()
	{
		const row = new DataRow(null);

		row.sources = this.propertiesPicker.sliceProperties(this.lastRow);

		for (const call of this.aggregationCalls) {
			row[DataRow.AGGREGATION_CACHE_PROPERTY][call.call.node.id] = call.result();
		}

		return row;
	}

	deinit()
	{
		for (const call of this.aggregationCalls) {
			call.instance.deinit();
		}

		this.lastRow = null;
	}
}

module.exports = Aggregation;
