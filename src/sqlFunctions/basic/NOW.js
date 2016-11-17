'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class NOW extends BasicFunction
{
	static dataType()
	{
		return DataType.DATE;
	}

	call()
	{
		return new Date;
	}
}

module.exports = NOW;
