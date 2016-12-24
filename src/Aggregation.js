'use strict';

const BasicColumn = require('./BasicColumn');
const AggregationColumn = require('./AggregationColumn');
const AggregationExpression = require('./AggregationExpression');
const PropertiesPicker = require('./PropertiesPicker');
const AggregationCallRuntime = require('./AggregationCallRuntime');
const DataRow = require('./DataRow');
const AsyncUtils = require('./AsyncUtils');

class Aggregation
{
	/**
	 *
	 * @param {PreparingContext} preparingContext
	 * @param {RuntimeContext} runtimeContext
	 * @param {Node} expressions
	 * @returns {Aggregation}
	 */
	constructor(preparingContext, runtimeContext, expressions)
	{
		this.runtimeContext = runtimeContext;
		this.expressions = expressions;
		this.lastRow = null;

		this.aggregationCallRuntimes = [];

		const aggregations = this.runtimeContext[this.runtimeContext.aggregationsPropertyName];

		for (const expression of this.expressions) {
			if (!(expression instanceof AggregationExpression)) {
				continue;
			}

			for (const ac of expression.aggregationCalls) {
				const state = new AggregationCallRuntime(preparingContext, runtimeContext, ac);

				this.aggregationCallRuntimes.push(state);

				aggregations[ac.node.id] = state.result.bind(state);
			}
		}

		const basicResultSetsMap = new Map;
		const aggregationResultSetsMap = new Map;

		for (const expression of this.expressions) {
			if (expression instanceof AggregationColumn) {
				aggregationResultSetsMap.set(expression.alias, expression.result);
			} else if (expression instanceof BasicColumn) {
				basicResultSetsMap.set(expression.alias, expression.valueSource());
			}
		}

		this.basicPropertiesPicker = new PropertiesPicker(basicResultSetsMap);
		this.aggregationPropertiesPicker = new PropertiesPicker(aggregationResultSetsMap);
	}

	init()
	{
		for (const call of this.aggregationCallRuntimes) {
			call.instance.init();
		}
	}

	/**
	 * @param {DataRow} row
	 * @param {Function} cb
	 * @returns {undefined}
	 */
	update(row, cb)
	{
		AsyncUtils.eachSeriesHalfSync(
			this.aggregationCallRuntimes,
			(call, done) => {
				call.update(row, done);
			},
			cb
		);

		this.lastRow = row;
	}

	/**
	 * @param {Function} cb
	 * @returns {undefined}
	 */
	result(cb)
	{
		const row = new DataRow(null);

		row.sources = this.basicPropertiesPicker.sliceProperties(this.lastRow);

		AsyncUtils.eachSeriesHalfSync(
			this.aggregationCallRuntimes,
			(call, done) => {
				call.result((result) => {
					row[DataRow.AGGREGATION_CACHE_PROPERTY][call.call.node.id] = result;
					done();
				});
			},
			() => {
				this.aggregationPropertiesPicker.mergeProperties(row, row.sources);

				cb(row);
			}
		);
	}

	deinit()
	{
		for (const call of this.aggregationCallRuntimes) {
			call.instance.deinit();
		}

		this.lastRow = null;
	}
}

module.exports = Aggregation;
