const BasicFunction = require('../../BasicFunction');

class CEIL extends BasicFunction
{
	call(args)
	{
		this.needArgumentsCount(args, 1);

		return Math.ceil(args[0]);
	}
}

module.exports = CEIL;
