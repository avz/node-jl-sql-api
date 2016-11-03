class BasicFunction
{
	call(args)
	{
		throw new Error('not implemented');
	}

	argumentException(text)
	{
		return new Error(text);
	}

	needArgumentsCount(args, count)
	{
		if (args.length < count) {
			throw this.argumentException('not enough arguments');
		}
	}
}

module.exports = BasicFunction;
