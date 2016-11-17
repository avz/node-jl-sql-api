'use strict';

const Node = require('../Node');

class GroupBy extends Node
{
	constructor(expression)
	{
		super();

		this.expression = expression;
	}

	childNodes()
	{
		return [this.expression];
	}
}

module.exports = GroupBy;
