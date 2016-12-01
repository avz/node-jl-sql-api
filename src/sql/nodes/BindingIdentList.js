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
}

module.exports = BindingIdentList;