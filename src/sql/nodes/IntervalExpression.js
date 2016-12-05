'use strict';

const Node = require('../Node');

class IntervalExpression extends Node
{
	constructor(expression, operator, interval)
	{
		super();

		this.expression = expression;
		this.operator = operator;
		this.interval = interval;
	}
}

module.exports = IntervalExpression;
