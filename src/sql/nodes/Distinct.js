const Node = require('../Node');

class Distinct extends Node
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

module.exports = Distinct;
