'use strict';

const Node = require('../Node');

class Delete extends Node
{
	constructor()
	{
		super();

		this.table = null;
		this.joins = [];
		this.where = null;
	}

	join(join)
	{
		this.joins.push(join);
	}

	childNodes()
	{
		return this.joins.concat(
			[this.table, this.where].filter(o => o !== null)
		);
	}
}

module.exports = Delete;
