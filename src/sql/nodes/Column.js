'use strict';

const Node = require('../Node');

class Column extends Node
{
	constructor(expression, alias = null, expressionSqlString = null)
	{
		super();

		this.alias = alias;
		this.expression = expression;
		this.expressionSqlString = expressionSqlString;
	}

	childNodes()
	{
		return [this.expression];
	}
}

module.exports = Column;
