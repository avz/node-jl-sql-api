'use strict';

const Node = require('../Node');

class BinaryOperation extends Node
{
	constructor(operator, left, right)
	{
		super();

		this.operator = operator;
		this.left = left;
		this.right = right;
	}

	childNodes()
	{
		return [this.left, this.right];
	}
}

module.exports = BinaryOperation;
