'use strict';

const JlTransform = require('../stream/JlTransform');
const JlTransformsChain = require('../stream/JlTransformsChain');
const JlPassThrough = require('../stream/JlPassThrough');

const JsonStringifier = require('../stream/JsonStringifier');
const LinesJoiner = require('../stream/LinesJoiner');
const ChunkSplitter = require('../stream/ChunkSplitter');

const DataSource = require('../DataSource');

const JsonParser = require('../stream/JsonParser');
const LinesSplitter = require('../stream/LinesSplitter');
const ChunkJoiner = require('../stream/ChunkJoiner');

const ProgramError = require('../error/ProgramError');

class PublicSelectFrom
{
	constructor(publicSelect, select, inputStream)
	{
		this.publicSelect = publicSelect;
		this.select = select;
		this.inputStream = inputStream;
	}

	toObjectsStream(stream = null)
	{
		const chain = [
			this.inputStream,
			this.select.stream(this.publicSelect.dataSourceResolversPool),
			new ChunkSplitter
		];

		if (stream) {
			stream.push(stream);
		}

		return new JlTransformsChain(chain);
	}

	toJsonStream(outputStream = null)
	{
		const chain = [
			this.inputStream,
			this.select.stream(this.publicSelect.dataSourceResolversPool),
			new JsonStringifier,
			new LinesJoiner
		];

		if (outputStream) {
			chain.push(outputStream);
		}

		const stream = new JlTransformsChain(chain);

		return stream;
	}

	toArrayOfObjects(cb)
	{
		if (typeof(cb) !== 'function') {
			throw new ProgramError('Function argument expected');
		}

		const output = this.toObjectsStream();
		const objects = [];

		output.on('data', function(object) {
			objects.push(object);
		});

		output.on('end', function() {
			cb(objects);
		});

		return output;
	}

	addArrayOfObjects(location, array)
	{
		const stream = new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		stream.end(array);

		this.publicSelect.dataSourceApiResolver.addDataSource(this._path(location), new DataSource(stream));

		return this;
	}

	addJsonStream(location, stream)
	{
		const chain = new JlTransformsChain([stream, new LinesSplitter, new JsonParser]);

		this.publicSelect.dataSourceApiResolver.addDataSource(
			this._path(location),
			new DataSource(chain)
		);

		return this;
	}

	addObjectsStream(location, stream)
	{
		this.publicSelect.dataSourceApiResolver.addDataSource(
			this._path(location),
			new DataSource(stream.pipe(new ChunkJoiner))
		);

		return this;
	}

	_path(location) {
		if (typeof(location) === 'string') {
			return [location];
		}

		if (!(location instanceof Array)) {
			throw new ProgramError('Array or string expected');
		}

		return location;
	}
}

module.exports = PublicSelectFrom;
