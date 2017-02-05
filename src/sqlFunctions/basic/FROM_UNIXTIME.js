'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class FROM_UNIXTIME extends BasicFunction
{
	static dataType()
	{
		return DataType.DATE;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		const ts = parseInt(args[0], 0);

		if (isNaN(ts)) {
			return null;
		}

		return new Date(ts * 1000);
	}
}

module.exports = FROM_UNIXTIME;
