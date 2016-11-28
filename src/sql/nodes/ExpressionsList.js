'use strict';

const Node = require('../Node');

class ExpressionsList extends Node
{
	constructor(values)
	{
		super();

		this.values = values;
	}

	push(value)
	{
		this.values.push(value);
	}

	childNodes()
	{
		return this.values;
	}
}

module.exports = ExpressionsList;
