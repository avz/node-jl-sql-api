'use strict';

const Node = require('../Node');

class BindingIdentList extends Node
{
	constructor(ident)
	{
		super();

		this.ident = ident.slice(1, -1);
		this.binded = null;
	}

	expand(binded)
	{
		this.binded = binded;
	}

	basename()
	{
		return this.ident.slice(2);
	}
}

module.exports = BindingIdentList;
