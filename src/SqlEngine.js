const SqlParser = require('./sql/Parser');
const SqlToJs = require('./SqlToJs');
const SqlNodes = require('./sql/Nodes');
const PropertiesPicker = require('./stream/PropertiesPicker');
const Filter = require('./stream/Filter');
const Sorter = require('./stream/Sorter');
const Mapper = require('./stream/Mapper');
const JlTransformsChain = require('./stream/JlTransformsChain');

class SqlEngine
{
	createTransform(sql)
	{
		const select = SqlParser.parse(sql);
		const sqlToJs = new SqlToJs;

		const usedFields = this.extractUsedFieldsPaths(sqlToJs, select);

		const chain = new JlTransformsChain;

		chain.append(new PropertiesPicker(usedFields));

		const aliaser = this.createColumnAliaser(sqlToJs, select);
		if (aliaser) {
//			chain.append(aliaser);
		}

		if (select.where) {
			chain.append(new Filter(sqlToJs.nodeToFunction(select.where)));
		}

		if (select.orders.length) {
			chain.append(new Sorter(this.createSortingFunction(sqlToJs, select.orders)));
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

		if (select.orders.length) {
			fields = mapMerge(fields, extractFields(select.orders));
		}

		return fields;
	}

	createSortingFunction(sqlToJs, select)
	{
		const valueFuncs = select.map(order => sqlToJs.nodeToFunction(order.expression));

		const compare = function(row1, row2) {
			for (let i = 0; i < valueFuncs.length; i++) {
				const valueFunc = valueFuncs[i];

				const v1 = valueFunc(row1);
				const v2 = valueFunc(row2);

				const direction = select.orders[i].direction === 'DESC' ? -1 : 1;

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

	createColumnAliaser(sqlTojs, select)
	{
		var map = new Map;

		for (let i = 0; i < select.columns.length; i++) {
			var column = select.columns[i];

			if (!column.alias) {
				if (column.expression instanceof SqlNodes.ColumnIdent) {
					continue;
				}

				throw new Error('All columns must have the alias');
			}

			if (column.expression instanceof SqlNodes.ColumnIdent) {
				map.set(column.alias.fragments, column.expression.fragments);
			} else {
				map.set(column.alias.fragments, sqlTojs.nodeToFunction(column.expression));
			}
		}

		if (!map.size) {
			return null;
		}

		return new PropertiesPicker(map);
	}
}

module.exports = SqlEngine;
