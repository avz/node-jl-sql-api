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

		for (let i = 0; i < select.columns.length; i++) {
			const selectColumn = select.columns[i];
			const column = this.analyseColumn(selectColumn);

			columnsMap.set(column.alias, column);
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

	isAggregagtion(expression)
	{
		const callIsAggregation = call => {
			const func = this.preparingContext.functionsMap.need(call.function.fragments);

			if (func.prototype instanceof AggregationFunction) {
				return true;
			}

			return false;
		}

		if (expression instanceof SqlNodes.Call) {
			if (callIsAggregation(expression)) {
				return true;
			}
		}

		for (let node in expression.eachChildNodeRecursive()) {
			if (!(node instanceof SqlNodes.Call)) {
				continue;
			}

			if (callIsAggregation(node)) {
				return true;
			}
		}

		return false;

	}

	/**
	 * @private
	 */
	column(alias, expression)
	{
		if (this.isAggregagtion(expression)) {
			return new AggregationColumn(this.preparingContext, alias, expression);
		} else {
			return new BasicColumn(this.preparingContext, alias, expression);
		}
	}
}

module.exports = ColumnsAnalyser;
