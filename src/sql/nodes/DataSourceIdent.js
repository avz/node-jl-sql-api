'use strict';

const Node = require('../Node');

class DataSourceIdent extends Node
{
	constructor(name)
	{
		super();

		this.name = name;
	}

	childNodes()
	{
		return [];
	}
}

module.exports = DataSourceIdent;
