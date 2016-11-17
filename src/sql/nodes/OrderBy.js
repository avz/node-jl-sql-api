'use strict';

const Node = require('../Node');

class OrderBy extends Node
{
	constructor(expression, direction = null, collation = null)
	{
		super();

		this.expression = expression;
		this.direction = direction;
		this.collation = collation;
	}

	childNodes()
	{
		return [this.expression];
	}
}

module.exports = OrderBy;
