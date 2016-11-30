'use strict';

const DataSource = require('./DataSource');
const ImplementationRequired = require('./error/ImplementationRequired');
const JlTransformsChain = require('./stream/JlTransformsChain');
const LineSplitter = require('./stream/LinesSplitter');
const ChunkJoiner = require('./stream/ChunkJoiner');
const JsonParser = require('./stream/JsonParser');

class DataSourceResolver
{
	_resolve(location)
	{
		const stream = this.resolve(location);

		if (!stream) {
			return null;
		}

		if (stream instanceof DataSource) {
			return stream;
		}

		if (!stream.outputType) {
			if (stream._readableState && stream._readableState.objectMode) {
				const objectsStream = new JlTransformsChain([
					stream,
					new ChunkJoiner
				]);

				return new DataSource(objectsStream);
			} else {
				const objectsStream = new JlTransformsChain([
					stream,
					new LineSplitter,
					new JsonParser
				]);

				return new DataSource(objectsStream);
			}
		} else {
			return new DataSource(stream);
		}
	}

	resolve(location)
	{
		throw new ImplementationRequired;
	}

	extractAlias(location)
	{
		return null;
	}
}

module.exports = DataSourceResolver;
