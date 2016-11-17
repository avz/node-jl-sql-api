'use strict';

const PassThrough = require('stream').PassThrough;

class JlPassThrough extends PassThrough
{
	constructor(inputType, outputType)
	{
		super({
			objectMode: true,
			highWaterMark: 1
		});

		this.inputType = inputType;
		this.outputType = outputType;
	}
}

module.exports = JlPassThrough;
