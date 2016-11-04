const JlTransform = require('../stream/JlTransform');
const JlPassThrough = require('../stream/JlPassThrough');
const JlTransformsChain = require('../stream/JlTransformsChain');

const JsonParser = require('../stream/JsonParser');
const LinesSplitter = require('../stream/LinesSplitter');
const ChunkJoiner = require('../stream/ChunkJoiner');

const SelectFromStream = require('./SelectFromStream');

class Select
{
	constructor(select)
	{
		this.select = select;
	}

	fromJsonStream()
	{
		const input = new JlTransformsChain([new LinesSplitter, new JsonParser]);

		return new SelectFromStream(this.select, input);
	}

	fromObjectsStream()
	{
		return new SelectFromStream(this.select, new ChunkJoiner);
	}

	fromArrayOfObjects(array)
	{
		const stream = new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		stream.end(array);

		return new SelectFromStream(this.select, stream);
	}
}

module.exports = Select;
