'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class UNIX_TIMESTAMP extends BasicFunction
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	call(args)
	{
		let now = new Date;

		if (args.length) {
			now = new Date(args[0]);
		}

		const ts = now.getTime();

		if (isNaN(ts)) {
			return null;
		}

		return Math.floor(ts / 1000);
	}
}

module.exports = UNIX_TIMESTAMP;
