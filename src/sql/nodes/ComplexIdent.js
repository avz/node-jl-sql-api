const Node = require('../Node');

class ComplexIdent extends Node
{
	constructor(ident)
	{
		super();

		this.fragments = [ident];
	}
}

module.exports = ComplexIdent;
