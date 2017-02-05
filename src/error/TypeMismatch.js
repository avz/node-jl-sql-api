'use strict';

const JlException = require('./JlException');

class TypeMismatch extends JlException
{
	constructor(actual, expected)
	{
		super(`Type mismatch: ${expected} expected, but ${actual} found`);
	}
}

module.exports = TypeMismatch;
