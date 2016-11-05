const PassThrough = require('stream').PassThrough;

class JlPassThrough extends PassThrough
{
	constructor(inputType, outputType)
	{
		super({
			objectMode: true
		});

		this.inputType = inputType;
		this.outputType = outputType;
	}
}

module.exports = JlPassThrough;
