const SqlParser = require('./sql/Parser');
const SqlToJs = require('./SqlToJs');
const SqlNodes = require('./sql/Nodes');
const PropertiesPicker = require('./stream/PropertiesPicker');
const Filter = require('./stream/Filter');
const Sorter = require('./stream/Sorter');
const Groupper = require('./stream/Groupper');
const JlTransformsChain = require('./stream/JlTransformsChain');
const JlTransform = require('./stream/JlTransform');
const JlPassThrough = require('./stream/JlPassThrough');

const PreparingContext = require('./PreparingContext');
const RuntimeContext = require('./RuntimeContext');
const ColumnsAnalyser = require('./ColumnsAnalyser');
const Aggregation = require('./Aggregation');
const AggregationColumn = require('./AggregationColumn');
const FunctionsMap = require('./FunctionsMap');

class SqlEngine
{
	createTransform(sql)
	{
		const functionsMap = new FunctionsMap;

		functionsMap.add(['SUM'], require('./sqlFunctions/SUM'));

		const runtimeContext = new RuntimeContext;

		const sqlToJs = new SqlToJs(
			functionsMap,
			runtimeContext
		);

		const preparingContext = new PreparingContext(
			sqlToJs,
			functionsMap
		);

		const select = SqlParser.parse(sql);
		const columnsAnalyser = new ColumnsAnalyser(preparingContext);
		const columns = columnsAnalyser.analyse(select);

		let implicitGroupper = null;

		if (!select.groups.length) {
			let hasAggregation = false;

			for (const [path, column] of columns) {
				if (column instanceof AggregationColumn) {
					hasAggregation = true;
					break;
				}
			}

			if (hasAggregation) {
				implicitGroupper = new Groupper(() => [null], new Aggregation(runtimeContext, columns));
			}
		}

		const chain = new JlTransformsChain;

		if (select.where) {
			chain.append(new Filter(sqlToJs.nodeToFunction(select.where)));
		}

		if (select.groups.length) {
			chain.append(new Sorter(this.createSortingFunction(sqlToJs, select.groups)));
			chain.append(this.createGroupper(sqlToJs, runtimeContext, columns, select.groups));
		} else if (implicitGroupper) {
			chain.append(implicitGroupper);
		} else {
			/*
			 * группировщик сам создаёт строки с нужными полями, поэтому вычленение
			 * полей нужно только для безгруппировочных запросов
			 */
			const m = new Map;

			for (const [path, column] of columns) {
				m.set(path, column.valueSource());
			}

			chain.append(new PropertiesPicker(m));
		}

		if (select.orders.length) {
			chain.append(new Sorter(this.createSortingFunction(sqlToJs, select.orders)));
		}

		if (chain.isEmpty()) {
			return new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS)
		}

		return chain;
	}

	createSortingFunction(sqlToJs, orders)
	{
		const valueFuncs = orders.map(order => sqlToJs.nodeToFunction(order.expression));

		const compare = function(row1, row2) {
			for (let i = 0; i < valueFuncs.length; i++) {
				const valueFunc = valueFuncs[i];

				const v1 = valueFunc(row1);
				const v2 = valueFunc(row2);

				const direction = orders[i].direction === 'DESC' ? -1 : 1;

				if (v1 > v2) {
					return direction;
				} else if (v1 < v2) {
					return -direction;
				}
			}

			return 0;
		};

		return compare;
	}

	createGroupper(sqlToJs, runtimeContext, columns, groups)
	{
		const keyGenerators = groups.map(g => sqlToJs.nodeToFunction(g.expression));

		const keyGeneratorCb = row => {
			return keyGenerators.map(g => g(row));
		};

		return new Groupper(keyGeneratorCb, new Aggregation(runtimeContext, columns));
	}
}

module.exports = SqlEngine;
