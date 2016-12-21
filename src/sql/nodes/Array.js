'use strict';

const Node = require('../Node');

class Array extends Node
{
	constructor(items)
	{
		super();

		this.items = items;
	}

	childNodes()
	{
		return this.items;
	}
}

module.exports = Array;
