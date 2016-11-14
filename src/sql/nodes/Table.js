const Node = require('../Node');

class Table extends Node
{
	constructor(location, alias = null)
	{
		super();

		this.alias = alias;
		this.location = location;
	}

	childNodes()
	{
		return [this.location];
	}
}

module.exports = Table;
