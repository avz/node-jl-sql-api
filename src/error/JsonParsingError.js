'use strict';

const JlException = require('./JlException');

class JsonParsingError extends JlException
{
	constructor(message, json)
	{
		super(message);
		this.json = json;
	}
}

module.exports = JsonParsingError;
