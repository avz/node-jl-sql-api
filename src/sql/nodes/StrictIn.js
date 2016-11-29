'use strict';

const Node = require('../Node');

class StrictIn extends Node
{
	constructor(needle, haystack)
	{
		super();

		this.needle = needle;
		this.haystack = haystack;
	}

	childNodes()
	{
		return [this.needle].concat(this.haystack);
	}
}

module.exports = StrictIn;
