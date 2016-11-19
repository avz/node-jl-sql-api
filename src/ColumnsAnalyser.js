'use strict';

const SqlNodes = require('./sql/Nodes');
const BasicColumn = require('./BasicColumn');
const AggregationColumn = require('./AggregationColumn');
const SqlLogicError = require('./error/SqlLogicError');
const BasicExpression = require('./BasicExpression');
const ExpressionAnalyser = require('./ExpressionAnalyser');
const AggregationExpression = require('./AggregationExpression');

class ColumnsAnalyser
{
	constructor(preparingContext)
	{
		this.expressionAnalyser = new ExpressionAnalyser(preparingContext);
		this.preparingContext = preparingContext;
	}

	analyseColumns(columns)
	{
		const columnsMap = new Map();

		if (columns) {
			for (const selectColumn of columns) {
				const column = this.analyseColumn(selectColumn);

				columnsMap.set(column.alias, column);
			}
		}

		return columnsMap;
	}

	analyseExpression(expression)
	{
		if (this.expressionAnalyser.isAggregationExpression(expression)) {
			return new AggregationExpression(this.preparingContext, expression);
		} else {
			return new BasicExpression(this.preparingContext, expression);
		}
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
				throw new SqlLogicError('You can\'t use aliases targeted on source');
			}

		} else if (column.expression instanceof SqlNodes.ColumnIdent) {
			alias = column.expression.fragments.slice();
			alias[0] = '@';
		}

		if (!alias) {
			alias = ['@', column.expressionSqlString];
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
		if (this.expressionAnalyser.isAggregationExpression(expression)) {
			return new AggregationColumn(this.preparingContext, alias, expression);
		} else {
			return new BasicColumn(this.preparingContext, alias, expression);
		}
	}
}

module.exports = ColumnsAnalyser;
