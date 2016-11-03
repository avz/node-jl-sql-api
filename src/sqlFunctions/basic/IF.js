const BasicFunction = require('../../BasicFunction');

class IF extends BasicFunction
{
	call(args)
	{
		this.needArgumentsCount(args, 3);

		return args[0] ? args[1] : args[2];
	}
}

module.exports = IF;
