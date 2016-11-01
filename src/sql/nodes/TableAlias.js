const Node = require('../Node');

class TableAlias extends Node
{
	constructor(ident)
	{
		super();

		this.name = ident.name;
	}
}

module.exports = TableAlias;
