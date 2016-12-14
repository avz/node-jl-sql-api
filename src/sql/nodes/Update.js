'use strict';

const Node = require('../Node');

class Update extends Node
{
	constructor()
	{
		super();

		this.sets = [];
		this.where = null;
	}

	childNodes()
	{
		return this.sets.concat(this.where ? [this.where] : []);
	}
}

module.exports = Update;
