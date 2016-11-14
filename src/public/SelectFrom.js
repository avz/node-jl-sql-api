const JlTransform = require('../stream/JlTransform');
const JlTransformsChain = require('../stream/JlTransformsChain');
const JlPassThrough = require('../stream/JlPassThrough');

const JsonStringifier = require('../stream/JsonStringifier');
const LinesJoiner = require('../stream/LinesJoiner');
const ChunkSplitter = require('../stream/ChunkSplitter');

const PassThrough = require('stream').PassThrough;

const DataStream = require('../DataStream');

const JsonParser = require('../stream/JsonParser');
const LinesSplitter = require('../stream/LinesSplitter');
const ChunkJoiner = require('../stream/ChunkJoiner');

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
			this.select.select.stream(this.select.dataStreamResolversPool),
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
			this.select.select.stream(this.select.dataStreamResolversPool),
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

	addArrayOfObjectsStream(location, array)
	{
		const stream = new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		stream.end(array);

		this.select.dataStreamApiResolver.addDataStream(this._path(location), new DataStream(stream));

		return this;
	}

	addJsonStream(location, stream)
	{
		const chain = stream.pipe(new LinesSplitter).pipe(new JsonParser);

		this.select.dataStreamApiResolver.addDataStream(
			this._path(location),
			new DataStream(chain)
		);

		return this;
	}

	addObjectsStream(location, stream)
	{
		this.select.dataStreamApiResolver.addDataStream(
			this._path(location),
			new DataStream(stream.pipe(new ChunkJoiner))
		);

		return this;
	}

	_path(location) {
		if (typeof(location) === 'string') {
			return [location];
		}

		if (typeof(location) !== 'string') {
			throw new Error('Array or string expected');
		}

		return location;
	}
}

module.exports = SelectFrom;
