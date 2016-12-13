'use strict';

const Node = require('../Node');

class Insert extends Node
{
	constructor(rows = [])
	{
		super();

		this.rows = rows;
	}

	push(row)
	{
		this.rows.push(row);
	}
}

module.exports = Insert;
