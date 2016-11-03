const BasicFunction = require('../../BasicFunction');

class UNIX_TIMESTAMP extends BasicFunction
{
	call(args)
	{
		let now = new Date;

		if (args.length) {
			now = new Date(args[0]);
		}

		return Math.floor(now.getTime() / 1000);
	}
}

module.exports = UNIX_TIMESTAMP;
