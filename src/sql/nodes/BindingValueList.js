'use strict';

const Node = require('../Node');

class BindingValueList extends Node
{
	constructor(ident)
	{
		super();

		this.ident = ident;
		this.ast = null;
	}

	expand(ast)
	{
		this.ast = ast;
	}

	childNodes()
	{
		return this.ast ? [this.ast] : [];
	}
}

module.exports = BindingValueList;
