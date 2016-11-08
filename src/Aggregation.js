const BasicColumn = require('./BasicColumn');
const AggregationColumn = require('./AggregationColumn');
const PropertiesPicker = require('./PropertiesPicker');
const AggregationCallRuntime = require('./AggregationCallRuntime');
const DataRow = require('./DataRow');

class Aggregation
{
	constructor(runtimeContext, columns)
	{
		this.runtimeContext = runtimeContext;
		this.columns = columns;
		this.lastRow = null;

		this.aggregationCalls = [];

		const aggregations = this.runtimeContext[this.runtimeContext.aggregationsPropertyName];

		for (let [path, column] of this.columns) {
			if (!(column instanceof AggregationColumn)) {
				continue;
			}

			for (let ac of column.aggregationCalls) {
				const state = new AggregationCallRuntime(ac);
				this.aggregationCalls.push(state);

				aggregations[ac.node.id] = state.result.bind(state);
			}
		}

		this.propertiesPicker = new PropertiesPicker;
		this.resultSetsMap = new Map;

		for (let [path, column] of this.columns) {
			if (column instanceof AggregationColumn) {
				this.resultSetsMap.set(path, column.result);
			} else {
				this.resultSetsMap.set(path, column.valueSource());
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

		return row;
	}

	deinit()
	{
		for (let call of this.aggregationCalls) {
			call.instance.deinit();
		}

		this.lastRow = null;
	}
}

module.exports = Aggregation;
