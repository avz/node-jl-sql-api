'use strict';

const BinaryOperation = require('./BinaryOperation');

class RegexpOperation extends BinaryOperation
{
	constructor(operator, left, right)
	{
		super(operator, left, right);
	}
}

module.exports = RegexpOperation;
