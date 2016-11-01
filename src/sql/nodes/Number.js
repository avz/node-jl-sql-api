const Node = require('../Node');

class Number extends Node
{
	constructor(number)
	{
		super();

		this.value = number - 0;
	}
}

module.exports = Number;
