'use strict';

const Node = require('../Node');

class String extends Node
{
	constructor(string)
	{
		super();

		this.value = string.substr(1, string.length - 2);
	}
}

module.exports = String;
