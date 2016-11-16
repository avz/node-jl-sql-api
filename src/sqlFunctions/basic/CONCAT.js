const BasicFunction = require('../../BasicFunction');
const DataType = require('../../DataType');

class CONCAT extends BasicFunction
{
	static dataType()
	{
		return DataType.STRING;
	}

	call(args)
	{
		return args.join('');
	}
}

module.exports = CONCAT;
