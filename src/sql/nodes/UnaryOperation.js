'use strict';

const Node = require('../Node');

class UnaryOperation extends Node
{
	constructor(operator, right)
	{
		super();

		this.operator = operator;
		this.right = right;
	}

	childNodes()
	{
		return [this.right];
	}
}

module.exports = UnaryOperation;
