'use strict';

const Node = require('../Node');

class Interval extends Node
{
	constructor()
	{
		super();

		this.deltas = [];
	}

	add(expression, unit)
	{
		this.deltas.push({expression, unit});
	}

	childNodes()
	{
		const childs = [];

		for (const d of this.deltas) {
			childs.push(d.expression);
		}

		return childs;
	}
}

Interval.UNIT_YEAR = 'year';
Interval.UNIT_MONTH = 'month';
Interval.UNIT_DAY = 'day';
Interval.UNIT_HOUR = 'hour';
Interval.UNIT_MINUTE = 'minute';
Interval.UNIT_SECOND = 'second';

module.exports = Interval;
