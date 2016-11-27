'use strict';

const ComplexIdent = require('./ComplexIdent');

class ColumnIdent extends ComplexIdent
{
	static fromComplexIdent(complexIdent)
	{
		const ident = new this.prototype.constructor([]);

		ident.fragments = complexIdent.fragments.slice(0);

		return ident;
	}
}

module.exports = ColumnIdent;
