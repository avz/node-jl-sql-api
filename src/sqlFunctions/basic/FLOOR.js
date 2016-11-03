const BasicFunction = require('../../BasicFunction');

class FLOOR extends BasicFunction
{
	call(args)
	{
		this.needArgumentsCount(args, 1);

		return Math.floor(args[0]);
	}
}

module.exports = FLOOR;
