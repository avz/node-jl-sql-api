'use strict';

const JlTransform = require('./JlTransform');

class ChunkJoiner extends JlTransform
{
	constructor(chunkMaxSize = 100)
	{
		super(JlTransform.OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.chunkMaxSize = chunkMaxSize;
		this.chunk = [];
	}

	_transform(object, charset, cb)
	{
		this.chunk.push(object);

		if (this.chunk.length >= this.chunkMaxSize) {
			this.push(this.chunk);
			this.chunk = [];
		}

		cb();
	}

	_flush(cb)
	{
		this.push(this.chunk);
		this.chunk = [];

		cb();
	}
}

module.exports = ChunkJoiner;
