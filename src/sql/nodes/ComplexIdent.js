'use strict';

const Node = require('../Node');

class ComplexIdent extends Node
{
	constructor(fragments)
	{
		super();

		this.fragments = fragments;
	}
}

module.exports = ComplexIdent;
