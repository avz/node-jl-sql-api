'use strict';

const JlTransform = require('./JlTransform');

class ChunkSplitter extends JlTransform
{
	constructor()
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.OBJECTS);
	}

	_transform(chunk, charset, cb)
	{
		for (var i = 0; i < chunk.length; i++) {
			this.push(chunk[i]);
		}

		cb();
	}
}

module.exports = ChunkSplitter;
