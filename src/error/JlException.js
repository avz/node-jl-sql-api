'use strict';

class JlException extends Error
{
	constructor(...args)
	{
		super(...args);
		this.name = this.constructor.name;
	}
}

module.exports = JlException;
