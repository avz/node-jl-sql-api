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

		const chain = new JlTransformsChain;

//		if (select.columns) {
//			chain.append(new PropertiesPicker(this.extractUsedFieldsPaths(sqlToJs, select)));
//		}

//		if (select.where) {
//			chain.append(new Filter(sqlToJs.nodeToFunction(select.where)));
//		}

		if (select.groups.length) {
			chain.append(new Sorter(this.createSortingFunction(sqlToJs, select.groups)));

			const keyGenerators = select
				.groups
				.map(g => sqlToJs.nodeToFunction(g.expression))
			;

			const keyGeneratorCb = row => {
				return keyGenerators.map(g => g(row));
			};

			chain.append(new Groupper(keyGeneratorCb, new Aggregation(runtimeContext, columns)));
		}

		if (select.orders.length) {
			chain.append(new Sorter(this.createSortingFunction(sqlToJs, select.orders)));
		}

		if (chain.isEmpty()) {
			return new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS)
		}

		return chain;
	}

	extractUsedFieldsPaths(sqlToJs, select)
	{
		function mapMerge(map1, map2)
		{
			var m = new Map(map1);

			for (let [k, v] of map2) {
				m.set(k, v);
			}

			return m;
		}

		function extractFields(nodes) {
			let paths = new Map;

			for (let i = 0; i < nodes.length; i++) {
				const node = nodes[i];

				if (node instanceof SqlNodes.Column) {
					const column = node;

					if (!column.alias) {
						if (column.expression instanceof SqlNodes.ColumnIdent) {
							continue;
						}

						throw new Error('All columns must have the alias');
					}

					if (column.expression instanceof SqlNodes.ColumnIdent) {
						paths.set(column.alias.fragments, column.expression.fragments);
					} else {
						paths.set(column.alias.fragments, sqlToJs.nodeToFunction(column.expression));
					}
				}

				if (node instanceof SqlNodes.ColumnIdent) {
					paths.set(node.fragments, node.fragments);
				}

				paths = mapMerge(paths, extractFields(node.childNodes()));
			}

			return paths;
		};

		var fields = extractFields(select.columns);

		if (select.where) {
			fields = mapMerge(fields, extractFields([select.where]));
		}

		if (select.groups.length) {
			fields = mapMerge(fields, extractFields(select.groups));
		}

		if (select.orders.length) {
			fields = mapMerge(fields, extractFields(select.orders));
		}

		return fields;
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
}

module.exports = SqlEngine;
