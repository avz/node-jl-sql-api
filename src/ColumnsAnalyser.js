const SqlNodes = require('./sql/Nodes');
const BasicColumn = require('./BasicColumn');
const AggregationColumn = require('./AggregationColumn');

const AggregationFunction = require('./AggregationFunction');

class ColumnsAnalyser
{
	constructor(preparingContext)
	{
		this.preparingContext = preparingContext;
	}

	analyse(select)
	{
		const columnsMap = new Map();

		if (select.columns) {
			for (let selectColumn of select.columns) {
				const column = this.analyseColumn(selectColumn);

				columnsMap.set(column.alias, column);
			}
		}

		return columnsMap;
	}

	/**
	 * @private
	 */
	analyseColumn(column)
	{
		var alias = null;

		if (column.alias) {
			alias = column.alias.fragments;
			if (alias[0] !== '@') {
				throw new Error('You can\'t use aliases targeted on source');
			}

		} else if (column.expression instanceof SqlNodes.ColumnIdent) {
			alias = column.expression.fragments;
		}

		if (!alias) {
			throw new Error('All columns must have the alias');
		}

		return this.column(
			alias,
			column.expression
		);
	}

	/**
	 * @private
	 */
	column(alias, expression)
	{
		if (this.preparingContext.isAggregationExpression(expression)) {
			return new AggregationColumn(this.preparingContext, alias, expression);
		} else {
			return new BasicColumn(this.preparingContext, alias, expression);
		}
	}
}

module.exports = ColumnsAnalyser;
