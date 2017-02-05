'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');
const STRING = require('./STRING');

class CONCAT extends BasicFunction
{
	static dataType()
	{
		return DataType.STRING;
	}

	_stringify(arg)
	{
		return STRING.prototype.call([arg]);
	}

	call(args)
	{
		return args.map(this._stringify).join('');
	}
}

module.exports = CONCAT;
