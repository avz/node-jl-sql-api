const Node = require('../Node');

class Boolean extends Node
{
	constructor(bool)
	{
		super();

		this.value = !!bool;
	}
}

module.exports = Boolean;
