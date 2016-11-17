'use strict';

const ImplementationRequired = require('./error/ImplementationRequired');
const SqlFunctionArgumentError = require('./error/SqlFunctionArgumentError');

class BasicFunction
{
	call(args)
	{
		throw new ImplementationRequired;
	}

	argumentException(text)
	{
		return new SqlFunctionArgumentError(text);
	}

	needArgumentsCount(args, count)
	{
		if (args.length < count) {
			throw this.argumentException('not enough arguments');
		}
	}

	static dataType()
	{
		throw new ImplementationRequired;
	}
}

module.exports = BasicFunction;
