const BasicFunction = require('../../BasicFunction');

class ROUND extends BasicFunction
{
	call(args)
	{
		this.needArgumentsCount(args, 1);

		return Math.round(args[0]);
	}
}

module.exports = ROUND;
