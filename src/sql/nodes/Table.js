'use strict';

const Node = require('../Node');

class Table extends Node
{
	constructor(source, alias = null)
	{
		super();

		this.alias = alias;
		this.source = source;
	}

	childNodes()
	{
		return [this.source];
	}
}

module.exports = Table;
