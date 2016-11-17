'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class CEIL extends BasicFunction
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		return Math.ceil(args[0]);
	}
}

module.exports = CEIL;
