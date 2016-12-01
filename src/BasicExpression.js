'use strict';

const SqlNodes = require('./sql/Nodes');
const DataRow = require('./DataRow');

class BasicExpression
{
	constructor(preparingContext, expression)
	{
		/**
		 * @type PreparingContext
		 */
		this.preparingContext = preparingContext;

		/**
		 * @type Node
		 */
		this.expression = expression;
	}

	valueSource()
	{
		if (this.expression instanceof SqlNodes.ColumnIdent) {
			/*
			 * оптимизированный вариант для случая, когда значение просто
			 * берётся из свойства без всякой обработки
			 */
			const path = this.expression.getFragments().slice();

			path.unshift(DataRow.SOURCES_PROPERTY);

			return path;
		}

		return this.preparingContext.sqlToJs.nodeToFunction(this.expression);
	}
}

module.exports = BasicExpression;
