'use strict';

const Node = require('../Node');

class TableLocation extends Node
{
	constructor(complexIdent)
	{
		super();

		const source = complexIdent.fragments.shift();

		if (source !== '@') {
			throw new Error('Invalid table location');
		}

		this.fragments = complexIdent.fragments;
	}
}

module.exports = TableLocation;
