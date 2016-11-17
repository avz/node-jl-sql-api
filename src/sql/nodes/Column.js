'use strict';

const Node = require('../Node');

class Column extends Node
{
	constructor(expression, alias = null)
	{
		super();

		this.alias = alias;
		this.expression = expression;
	}

	childNodes()
	{
		return [this.expression];
	}
}

module.exports = Column;
