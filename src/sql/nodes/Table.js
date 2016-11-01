const Node = require('../Node');

class Table extends Node
{
	constructor(ident, alias = null)
	{
		super();

		this.alias = alias;
		this.ident = ident;
	}

	childNodes()
	{
		return [this.ident];
	}
}

module.exports = Table;
