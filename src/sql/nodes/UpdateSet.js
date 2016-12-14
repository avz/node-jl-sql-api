'use strict';

const Node = require('../Node');

class UpdateSet extends Node
{
	constructor(columnIdent, expression)
	{
		super();

		this.columnIdent = columnIdent;
		this.expression = expression;
	}

	childNodes()
	{
		return [this.columnIdent, this.expression];
	}
}

module.exports = UpdateSet;
