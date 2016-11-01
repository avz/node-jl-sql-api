const Node = require('../Node');

class FunctionIdent extends Node
{
	constructor(complexIdent)
	{
		super();

		this.fragments = complexIdent.fragments;
	}
}

module.exports = FunctionIdent;
