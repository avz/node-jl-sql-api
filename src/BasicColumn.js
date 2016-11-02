const SqlNodes = require('./sql/Nodes');

class BasicColumn
{
	constructor(preparingContext, alias, expression)
	{
		/**
		 * @type PreparingContext
		 */
		this.preparingContext = preparingContext;

		this.alias = alias;

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
			return this.expression.fragments;
		}

		return this.preparingContext.sqlToJs.nodeToFunction(this.expression);
	}
}

module.exports = BasicColumn;
