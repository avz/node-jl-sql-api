const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class FLOOR extends BasicFunction
{
	static dataType()
	{
		return DataType.NUMBER;
	}

	call(args)
	{
		this.needArgumentsCount(args, 1);

		return Math.floor(args[0]);
	}
}

module.exports = FLOOR;
