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

		const r = Math.ceil(args[0]);

		return isNaN(r) ? null : r;
	}
}

module.exports = CEIL;
