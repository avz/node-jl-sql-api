'use strict';

const DataSource = require('./DataSource');
const ImplementationRequired = require('./error/ImplementationRequired');
const JlTransformsChain = require('./stream/JlTransformsChain');
const JsonSplitter = require('./stream/JsonSplitter');
const ChunkJoiner = require('./stream/ChunkJoiner');
const JsonParser = require('./stream/JsonParser');

class DataSourceResolver
{
	/**
	 *
	 * @param {string[]} location
	 * @returns {DataSource|null}
	 */
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
					new JsonSplitter,
					new JsonParser
				]);

				return new DataSource(objectsStream);
			}
		} else {
			return new DataSource(stream);
		}
	}

	/**
	 *
	 * @param {string[]} location
	 * @returns {DataSource}
	 */
	resolve(location)
	{
		throw new ImplementationRequired;
	}

	/**
	 *
	 * @param {string[]} location
	 * @returns {string}
	 */
	extractAlias(location)
	{
		return null;
	}
}

module.exports = DataSourceResolver;
