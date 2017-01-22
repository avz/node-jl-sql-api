'use strict';

const Node = require('../Node');

class BetweenOperation extends Node
{
	constructor(left, rangeStart, rangeEnd)
	{
		super();

		this.left = left;
		this.rangeStart = rangeStart;
		this.rangeEnd = rangeEnd;
	}
}

module.exports = BetweenOperation;
