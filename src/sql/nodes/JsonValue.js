'use strict';

const Node = require('../Node');

class JsonValue extends Node
{
	constructor(value)
	{
		super();

		this.value = value;
	}
}

module.exports = JsonValue;
