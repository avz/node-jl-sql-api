'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class DATE extends BasicFunction
{
	static dataType()
	{
		return DataType.STRING;
	}

	call(args)
	{
		let now = new Date;

		if (args.length) {
			if (typeof(args[0]) !== 'number' && typeof(args[0]) !== 'string') {
				return null;
			}

			now = new Date(args[0]);
		}

		if (isNaN(now.getTime())) {
			return null;
		}

		return now.getFullYear() +
			'-' + (100 + now.getMonth() + 1).toString().substr(1) +
			'-' + (100 + now.getDate()).toString().substr(1)
		;
	}
}

module.exports = DATE;
