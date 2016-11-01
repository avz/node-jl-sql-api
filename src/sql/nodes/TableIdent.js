const Node = require('../Node');

class TableIdent extends Node
{
	constructor(complexIdent)
	{
		super();

		this.fragments = complexIdent.fragments;
	}
}

module.exports = TableIdent;
