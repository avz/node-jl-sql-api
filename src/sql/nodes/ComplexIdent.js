'use strict';

const Node = require('../Node');
const Quoter = require('../../Quoter');

class ComplexIdent extends Node
{
	constructor(fragments)
	{
		super();

		this.fragments = fragments.map(ComplexIdent._unquote);
	}

	static _unquote(string)
	{
		return Quoter.unquoteOptionalQuotes(string, '`');
	}

	addFragment(fragment)
	{
		this.fragments.push(ComplexIdent._unquote(fragment));
	}
}

module.exports = ComplexIdent;
