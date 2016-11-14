const JlTransform = require('../stream/JlTransform');
const JlPassThrough = require('../stream/JlPassThrough');
const JlTransformsChain = require('../stream/JlTransformsChain');

const JsonParser = require('../stream/JsonParser');
const LinesSplitter = require('../stream/LinesSplitter');
const ChunkJoiner = require('../stream/ChunkJoiner');

const SelectFrom = require('./SelectFrom');

const DataStreamApiResolver = require('../DataStreamApiResolver');
const DataStreamResolversPool = require('../DataStreamResolversPool');

class Select
{
	constructor(select, dataStreamResolvers = [])
	{
		this.select = select;
		this.dataStreamApiResolver = new DataStreamApiResolver;

		this.dataStreamResolversPool = new DataStreamResolversPool;

		for (const resolver of dataStreamResolvers) {
			this.dataStreamResolversPool.add(resolver);
		}

		this.dataStreamResolversPool.add(this.dataStreamApiResolver);
	}

	fromJsonStream(stream)
	{
		const chain = [new LinesSplitter, new JsonParser];
		if (stream) {
			chain.unshift(stream);
		}

		const input = new JlTransformsChain(chain);

		return new SelectFrom(this, input);
	}

	fromObjectsStream(stream)
	{
		var input = new ChunkJoiner;

		if (stream) {
			input = new JlTransformsChain([stream, input]);
		}

		return new SelectFrom(this, input);
	}

	fromArrayOfObjects(array)
	{
		const stream = new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		stream.end(array);

		return new SelectFrom(this, stream);
	}
}

module.exports = Select;
