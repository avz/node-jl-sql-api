const SqlParser = require('./sql/Parser');
const SqlToJs = require('./SqlToJs');
const SqlNodes = require('./sql/Nodes');
const PropertiesPicker = require('./stream/PropertiesPicker');
const Filter = require('./stream/Filter');

class SqlEngine
{
	createTransform(sql)
	{
		const select = SqlParser.parse(sql);
		const sqlToJs = new SqlToJs;

		var usedFields = this.extractUsedFieldsPaths(select);

		var stream = new PropertiesPicker(usedFields);

		if (select.where) {
			stream = stream.pipe(new Filter(sqlToJs.nodeToFunction(select.where)));
		}

		return stream;
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

		return extractFields(select.columns);
	}
}

module.exports = SqlEngine;
