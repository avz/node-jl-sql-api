'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class FLOOR extends BasicFunction
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		const r = Math.floor(args[0]);

		return isNaN(r) ? null : r;
	}
}

module.exports = FLOOR;
