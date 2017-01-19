'use strict';

const BinaryOperation = require('./BinaryOperation');

class LikeOperation extends BinaryOperation
{
	constructor(operator, left, right)
	{
		super(operator, left, right);

		this.caseSensitive = operator === 'LIKE';
	}
}

module.exports = LikeOperation;
