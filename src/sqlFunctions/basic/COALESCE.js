const BasicFunction = require('../../BasicFunction');

class COALESCE extends BasicFunction
{
	call(args)
	{
		this.needArgumentsCount(args, 1);

		for (const arg of args) {
			if (arg !== null && arg !== undefined) {
				return arg;
			}
		}

		return null
	}
}

module.exports = COALESCE;
