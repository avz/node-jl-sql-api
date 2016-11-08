const Node = require('../Node');

class DataSourceIdent extends Node
{
	constructor(name)
	{
		super();

		this.name = name;
	}
}

module.exports = DataSourceIdent;
