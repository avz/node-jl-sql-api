'use strict';

const ComplexIdent = require('./ComplexIdent');

class FunctionIdent extends ComplexIdent
{
	constructor(complexIdent)
	{
		super([]);
		this.fragments = complexIdent.fragments.slice(1);
	}
}

module.exports = FunctionIdent;
