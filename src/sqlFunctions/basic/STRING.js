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

		/* eslint-disable indent, no-unreachable */
		switch (typeof(value)) {
			case 'string':
				return value;
			break;
			case 'number':
				return NumberUtils.toDecString(value);
			break;
			case 'boolean':
				return value ? 'true' : 'false';
			break;
			case 'undefined':
				return '';
			break;
			default:
				if (value === null) {
					return 'null';
				}

				return '[object Object]';
			break;
		}
		/* eslint-enable indent, no-unreachable */
	}
}

module.exports = STRING;
