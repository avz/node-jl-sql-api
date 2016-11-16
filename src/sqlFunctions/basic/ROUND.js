const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class ROUND extends BasicFunction
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		return Math.round(args[0]);
	}
}

module.exports = ROUND;
