'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class ROUND extends BasicFunction
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		const r = Math.round(args[0]);

		return isNaN(r) ? null : r;
	}
}

module.exports = ROUND;
