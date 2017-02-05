'use strict';

const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');
const NumberUtils = require('../../NumberUtils');

class STRING extends BasicFunction
{
	static dataType()
	{
		return DataType.STRING;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		const value = args[0];

		var result;

		/* eslint-disable indent, no-unreachable */
		switch (typeof(value)) {
			case 'string':
				result = value;
			break;
			case 'number':
				result = NumberUtils.toDecString(value);
			break;
			case 'boolean':
				result = value ? 'true' : 'false';
			break;
			case 'undefined':
				result = '';
			break;
			default:
				if (value === null) {
					result = 'null';
				} else {
					result = '[object Object]';
				}
			break;
		}
		/* eslint-enable indent, no-unreachable */

		return result;
	}
}

module.exports = STRING;
