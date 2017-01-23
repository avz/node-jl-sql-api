'use strict';

const Node = require('../Node');

class Null extends Node
{
	constructor()
	{
		super();

		this.value = null;
	}

	childNodes()
	{
		return [];
	}
}

module.exports = Null;
