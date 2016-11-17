'use strict';

const Transform = require('stream').Transform;

class JlTransform extends Transform
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

JlTransform.RAW = 'JlTransform.RAW';
JlTransform.ANY = 'JlTransform.ANY';
JlTransform.OBJECTS = 'JlTransform.OBJECTS';
JlTransform.ARRAYS_OF_OBJECTS = 'JlTransform.ARRAYS_OF_OBJECTS';

module.exports = JlTransform;
