'use strict';

const Node = require('../Node');
const Quoter = require('../../Quoter');

class FunctionIdent extends Node
{
	constructor(fragments)
	{
		super();

		this.fragments = fragments.map(FunctionIdent._unquote);
	}

	static _unquote(string)
	{
		return Quoter.unquoteOptionalQuotes(string, '`');
	}

	static fromComplexIdent(complexIdent)
	{
		const ident = new this.prototype.constructor([]);

		ident.fragments = complexIdent.fragments.slice(1);

		return ident;
	}
}

module.exports = FunctionIdent;
