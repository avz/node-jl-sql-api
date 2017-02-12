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
	/**
	 *
	 * @param {PreparingContext} preparingContext
	 * @returns {ColumnsAnalyser}
	 */
	constructor(preparingContext)
	{
		this.expressionAnalyser = new ExpressionAnalyser(preparingContext);
		this.preparingContext = preparingContext;
	}

	/**
	 *
	 * @param {Column[]} columns
	 * @returns {Map<string[], BasicColumn|AggregationColumn>}
	 */
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

	/**
	 *
	 * @param {Node} expression
	 * @returns {AggregationExpression|BasicExpression}
	 */
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
	 * @param {Node} column
	 * @returns {BasicColumn|AggregationColumn}
	 */
	analyseColumn(column)
	{
		var alias = null;

		if (column.alias) {
			alias = column.alias.getFragments();
			if (alias[0] !== '@') {
				throw new SqlLogicError('You can\'t use aliases targeted on source');
			}

		} else if (column.expression instanceof SqlNodes.ColumnIdent) {
			if (column.expression.fragments.every(s => typeof(s) === 'string')) {
				alias = column.expression.getFragments().slice();
				alias[0] = '@';
			}
		}

		if (!alias) {
			alias = ['@', column.expressionSqlString];
		}

		return this.column(
			alias,
			column.expression,
			!!column.alias
		);
	}

	/**
	 * @private
	 * @param {string[]} alias
	 * @param {Node} expression
	 * @param {boolean} isUserDefinedAlias
	 * @returns {BasicColumn|AggregationColumn}
	 */
	column(alias, expression, isUserDefinedAlias)
	{
		if (this.expressionAnalyser.isAggregationExpression(expression)) {
			return new AggregationColumn(this.preparingContext, alias, expression, isUserDefinedAlias);
		} else {
			return new BasicColumn(this.preparingContext, alias, expression, isUserDefinedAlias);
		}
	}
}

module.exports = ColumnsAnalyser;
