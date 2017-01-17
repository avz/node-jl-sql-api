'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class NUMBER extends BasicFunction
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		if (typeof(args[0]) === 'object') {
			return null;
		}

		const v = parseFloat(args[0]);

		return isNaN(v) ? null : v;
	}
}

module.exports = NUMBER;
