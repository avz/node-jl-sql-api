'use strict';

const JlTransform = require('./JlTransform');

class LinesJoiner extends JlTransform
{
	constructor()
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.RAW);

		this.glue = '\n';
	}

	_transform(chunk, encoding, cb)
	{
		this.push(chunk.join(this.glue) + this.glue);

		cb();
	}
}

module.exports = LinesJoiner;
