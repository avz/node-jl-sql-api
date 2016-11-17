'use strict';

const JlTransform = require('./JlTransform');

class JsonStringifier extends JlTransform
{
	constructor()
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);
	}

	_transform(chunk, encoding, cb)
	{
		var jsons = [];

		for (var i = 0; i < chunk.length; i++) {
			jsons.push(JSON.stringify(chunk[i]));
		}

		this.push(jsons);

		cb();
	}
}

module.exports = JsonStringifier;
