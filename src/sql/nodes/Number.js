'use strict';

const Node = require('../Node');

class Number extends Node
{
	constructor(number)
	{
		super();

		this.value = number - 0;
	}

	childNodes()
	{
		return [];
	}
}

module.exports = Number;
