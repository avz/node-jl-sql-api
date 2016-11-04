const JlTransform = require('../stream/JlTransform');
const JlPassThrough = require('../stream/JlPassThrough');
const JlTransformsChain = require('../stream/JlTransformsChain');

const JsonParser = require('../stream/JsonParser');
const LinesSplitter = require('../stream/LinesSplitter');
const ChunkJoiner = require('../stream/ChunkJoiner');

const SelectFrom = require('./SelectFrom');

class Select
{
	constructor(select)
	{
		this.select = select;
	}

	fromJsonStream(stream)
	{
		const chain = [new LinesSplitter, new JsonParser];
		if (stream) {
			chain.unshift(stream);
		}

		const input = new JlTransformsChain(chain);

		return new SelectFrom(this.select, input);
	}

	fromObjectsStream(stream)
	{
		var input = new ChunkJoiner;

		if (stream) {
			input = new JlTransformsChain([stream, input]);
		}

		return new SelectFrom(this.select, input);
	}

	fromArrayOfObjects(array)
	{
		const stream = new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		stream.end(array);

		return new SelectFrom(this.select, stream);
	}
}

module.exports = Select;
