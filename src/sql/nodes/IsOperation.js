'use strict';

const Node = require('../Node');

class IsOperation extends Node
{
	constructor(left, exprected)
	{
		super();

		this.left = left;
		this.expected = exprected.toLowerCase();

		if (this.expected === 'boolean') {
			this.expected = 'bool';
		}
	}

	childNodes()
	{
		return [this.left];
	}
}

module.exports = IsOperation;
