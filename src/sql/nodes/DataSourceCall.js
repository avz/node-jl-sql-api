'use strict';

const Node = require('../Node');

class DataSourceCall extends Node
{
	constructor(functionIdent, source = null, options = null)
	{
		super();

		this.function = functionIdent;
		this.source = source;
		this.options = options;
	}

	childNodes()
	{
		return [this.function].concat([this.source, this.options].filter(a => a !== null));
	}
}

module.exports = DataSourceCall;
