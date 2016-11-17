'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class STRING extends BasicFunction
{
	static dataType()
	{
		return DataType.STRING;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		return '' + args[0];
	}
}

module.exports = STRING;
