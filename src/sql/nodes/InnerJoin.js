'use strict';

const Node = require('../Node');

class InnerJoin extends Node
{
	constructor(table, expression)
	{
		super();

		this.table = table;
		this.expression = expression;
	}

	childNodes()
	{
		return [this.table, this.expression];
	}
}

module.exports = InnerJoin;
