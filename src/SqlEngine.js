const SqlParser = require('./sql/Parser');
const SqlToJs = require('./SqlToJs');
const SqlNodes = require('./sql/Nodes');
const PropertiesPicker = require('./stream/PropertiesPicker');
const Filter = require('./stream/Filter');
const Sorter = require('./stream/Sorter');
const JlTransformsChain = require('./stream/JlTransformsChain');

class SqlEngine
{
	createTransform(sql)
	{
		const select = SqlParser.parse(sql);
		const sqlToJs = new SqlToJs;

		var usedFields = this.extractUsedFieldsPaths(select);

		var chain = new JlTransformsChain;
		chain.append(new PropertiesPicker(usedFields));

		if (select.where) {
			chain.append(new Filter(sqlToJs.nodeToFunction(select.where)));
		}

		if (select.orders.length) {
			chain.append(new Sorter(this.createSortingFunction(sqlToJs, select.orders)));
		}

		return chain;
	}

	extractUsedFieldsPaths(select)
	{
		function extractFields(nodes) {
			var paths = [];

			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];

				if (node instanceof SqlNodes.ColumnIdent) {
					paths.push(node.fragments);
				}

				paths = paths.concat(extractFields(node.childNodes()));
			}

			return paths;
		};

		var fields = extractFields(select.columns);

		if (select.where) {
			fields = fields.concat(extractFields([select.where]));
		}

		if (select.orders.length) {
			fields = fields.concat(extractFields(select.orders));
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
