'use strict';

const Node = require('../Node');

class TableAlias extends Node
{
	constructor(ident)
	{
		super();

		this.name = ident.name;
	}

	childNodes()
	{
		return [];
	}
}

module.exports = TableAlias;
