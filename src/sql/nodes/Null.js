'use strict';

const Node = require('../Node');

class Null extends Node
{
	constructor()
	{
		super();

		this.value = null;
	}
}

module.exports = Null;
