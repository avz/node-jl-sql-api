'use strict';

class JsonParsingError extends Error
{
	constructor(message, json)
	{
		super(message);
		this.json = json;
	}
}

module.exports = JsonParsingError;
