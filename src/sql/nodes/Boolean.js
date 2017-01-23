'use strict';

const Node = require('../Node');

class Boolean extends Node
{
	constructor(bool)
	{
		super();

		this.value = !!bool;
	}

	childNodes()
	{
		return [];
	}
}

module.exports = Boolean;
