const JlTransform = require('../stream/JlTransform');
const JlTransformsChain = require('../stream/JlTransformsChain');
const JlPassThrough = require('../stream/JlPassThrough');

const JsonStringifier = require('../stream/JsonStringifier');
const LinesJoiner = require('../stream/LinesJoiner');
const ChunkSplitter = require('../stream/ChunkSplitter');

const PassThrough = require('stream').PassThrough;

const DataStream = require('../DataStream');

class SelectFrom
{
	constructor(select, inputStream)
	{
		this.select = select;
		this.inputStream = inputStream;
		this.additionalStreams = [];
	}

	toObjectsStream(stream)
	{
		const chain = new JlTransformsChain([
			this.inputStream,
			this.select.stream(this.additionalStreams),
			new ChunkSplitter
		]);

		if (stream) {
			return chain.pipe(stream);
		}

		return chain;
	}

	toJsonStream(outputStream)
	{
		const chain = new JlTransformsChain([
			this.inputStream,
			this.select.stream(this.additionalStreams),
			new JsonStringifier,
			new LinesJoiner
		]);

		if (outputStream) {
			return chain.pipe(outputStream);
		}

		return chain;
	}

	toArrayOfObjects(cb)
	{
		if (typeof(cb) !== 'function') {
			throw new Error('Function argument expected');
		}

		const output = this.toObjectsStream();
		const objects = [];

		output.on('data', function(object) {
			objects.push(object);
		});

		output.on('end', function() {
			cb(objects);
		});
	}

	addArrayOfObjectsStream(name, array)
	{
		const stream = new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		stream.end(array);

		this.additionalStreams.push(new DataStream(name, stream));

		return this;
	}
}

module.exports = SelectFrom;
