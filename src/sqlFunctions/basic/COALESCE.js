'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class COALESCE extends BasicFunction
{
	static dataType()
	{
		return DataType.MIXED;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		for (const arg of args) {
			if (arg !== null && arg !== undefined) {
				return arg;
			}
		}

		return null;
	}
}

module.exports = COALESCE;
