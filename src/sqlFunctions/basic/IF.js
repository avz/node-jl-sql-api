'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class IF extends BasicFunction
{
	static dataType()
	{
		return DataType.MIXED;
	}

	call(args)
	{
		this.needArgumentsCount(args, 3);

		return args[0] ? args[1] : args[2];
	}
}

module.exports = IF;
