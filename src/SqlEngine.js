const SqlParser = require('./sql/Parser');
const SqlNodes = require('./sql/Nodes');
const PropertiesPicker = require('./stream/PropertiesPicker');

class SqlEngine
{
	createTransform(sql)
	{
		const SqlNodes = require('./sql/Nodes');
		const select = SqlParser.parse(sql);

		var usedFields = this.extractUsedFieldsPaths(select);

		return new PropertiesPicker(usedFields);
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
