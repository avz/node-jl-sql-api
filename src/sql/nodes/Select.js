'use strict';

const Node = require('../Node');
const Limit = require('./Limit');

class Select extends Node
{
	constructor()
	{
		super();

		this.allColumns = false;
		this.columns = [];
		this.table = null;
		this.joins = [];
		this.where = null;
		this.groups = [];
		this.having = null;
		this.orders = [];
		this.limit = null;
		this.distinct = false;
	}

	join(join)
	{
		this.joins.push(join);
	}

	setLimit(count, offset)
	{
		this.limit = new Limit(count, offset);
	}

	groupBy(groups)
	{
		this.groups = groups;
	}

	orderBy(orders)
	{
		this.orders = orders;
	}

	childNodes()
	{
		return this.columns.concat(
			this.joins,
			this.groups,
			this.orders,
			[this.table, this.where, this.having, this.limit].filter(o => o !== null)
		);
	}
}

module.exports = Select;
