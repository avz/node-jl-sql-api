'use strict';

const Node = require('../Node');
const Quoter = require('../../Quoter');

class String extends Node
{
	constructor(string)
	{
		super();

		this.value = Quoter.unquote(string);
	}

	childNodes()
	{
		return [];
	}
}

module.exports = String;
