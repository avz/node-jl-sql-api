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

			for (let ac of expression.aggregationCalls) {
				const state = new AggregationCallRuntime(ac);
				this.aggregationCalls.push(state);

				aggregations[ac.node.id] = state.result.bind(state);
			}
		}

		this.propertiesPicker = new PropertiesPicker;
		this.resultSetsMap = new Map;

		for (const expression of this.expressions) {
			if (expression instanceof AggregationColumn) {
				this.resultSetsMap.set(expression.alias, expression.result);
			} else if (expression instanceof BasicColumn) {
				this.resultSetsMap.set(expression.alias, expression.valueSource());
			}
		}
	}

	init()
	{
		for (let call of this.aggregationCalls) {
			call.instance.init();
		}
	}

	update(row)
	{
		for (let call of this.aggregationCalls) {
			call.update(row);
		}

		this.lastRow = row;
	}

	result()
	{
		const row = new DataRow({});

		this.propertiesPicker.copyPropertiesMap(this.resultSetsMap, this.lastRow, row.sources);

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
