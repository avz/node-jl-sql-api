'use strict';

const Node = require('../Node');
const Quoter = require('../../Quoter');

class Ident extends Node
{
	constructor(name)
	{
		super();

		this.name = Ident._unquote(name);
	}

	static _unquote(string)
	{
		return Quoter.unquoteOptionalQuotes(string, '`');
	}

	childNodes()
	{
		return [];
	}
}

module.exports = Ident;
