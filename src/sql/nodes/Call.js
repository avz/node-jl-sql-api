'use strict';

const Node = require('../Node');
const Nodes = require('../Nodes');

class Call extends Node
{
	constructor(functionIdent, args = new Nodes.ExpressionsList([]))
	{
		super();

		this.function = functionIdent;
		this.args = args;
	}

	childNodes()
	{
		return [this.function].concat([this.args]);
	}
}

module.exports = Call;
