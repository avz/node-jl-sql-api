'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class RAND extends BasicFunction
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	call(args)
	{
		return Math.random();
	}
}

module.exports = RAND;
