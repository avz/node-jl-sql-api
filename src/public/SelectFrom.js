const JlTransform = require('../stream/JlTransform');
const JlTransformsChain = require('../stream/JlTransformsChain');
const JlPassThrough = require('../stream/JlPassThrough');

const JsonStringifier = require('../stream/JsonStringifier');
const LinesJoiner = require('../stream/LinesJoiner');
const ChunkSplitter = require('../stream/ChunkSplitter');

const PassThrough = require('stream').PassThrough;

class SelectFrom
{
	constructor(select, inputStream)
	{
		this.select = select;
		this.inputStream = inputStream;
	}

	toObjectsStream(stream)
	{
		const chain = [this.inputStream, this.select.stream(), new ChunkSplitter];
		if (stream) {
			chain.push(stream);
		}

		return new JlTransformsChain(chain);
	}

	toJsonStream(stream)
	{
		const chain = [
			this.inputStream,
			this.select.stream(),
			new JsonStringifier,
			new LinesJoiner
		];

		if (stream) {
			chain.push(stream);
		}

		return new JlTransformsChain(chain);
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
}

module.exports = SelectFrom;
