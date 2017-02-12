'use strict';

const ComplexIdent = require('./ComplexIdent');

class ColumnIdent extends ComplexIdent
{
	constructor(...args)
	{
		super(...args);

		this.expandedAlias = null;
	}

	static fromComplexIdent(complexIdent)
	{
		const ident = new this.prototype.constructor([]);

		ident.fragments = complexIdent.fragments.slice(0);

		return ident;
	}

	expandAlias(expression)
	{
		this.expandedAlias = expression;
	}
}

module.exports = ColumnIdent;
