const Node = require('../Node');

class FunctionIdent extends Node
{
	constructor(complexIdent)
	{
		super();

		this.fragments = complexIdent.fragments.slice(1);
	}
}

module.exports = FunctionIdent;
