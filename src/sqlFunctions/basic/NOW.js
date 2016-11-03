const BasicFunction = require('../../BasicFunction');

class NOW extends BasicFunction
{
	call()
	{
		return new Date;
	}
}

module.exports = NOW;
