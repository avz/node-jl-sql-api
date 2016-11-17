'use strict';

const Node = require('../Node');

class Ident extends Node
{
	constructor(name)
	{
		super();

		let refinedName;

		if (name[0] === '`') {
			refinedName = name.substr(1, name.length - 2);
		} else {
			refinedName = name;
		}

		this.name = refinedName;
	}
}

module.exports = Ident;
