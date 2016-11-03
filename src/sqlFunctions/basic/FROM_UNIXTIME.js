const BasicFunction = require('../../BasicFunction');

class FROM_UNIXTIME extends BasicFunction
{
	call(args)
	{
		this.needArgumentsCount(args, 1);

		return new Date(parseInt(args[0]) * 1000);
	}
}

module.exports = FROM_UNIXTIME;
