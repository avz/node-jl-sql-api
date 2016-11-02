const BasicColumn = require('./BasicColumn');
const AggregationColumn = require('./AggregationColumn');
const PropertiesPicker = require('./stream/PropertiesPicker');

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
				const elt = {
					call: ac,
					instance: new ac.func,
					update: function(row) {
						this.instance.update(this.call.args.map(cb => cb(row)));
					}
				};

				this.aggregationCalls.push(elt);

				aggregations[ac.node.id] = elt.instance.result.bind(elt.instance);
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
		const row = {};

		this.propertiesPicker.copyPropertiesMap(this.resultSetsMap, this.lastRow, row);

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
