'use strict';

const JlTransform = require('../stream/JlTransform');
const JlPassThrough = require('../stream/JlPassThrough');
const JlTransformsChain = require('../stream/JlTransformsChain');

const JsonParser = require('../stream/JsonParser');
const LinesSplitter = require('../stream/LinesSplitter');
const ChunkJoiner = require('../stream/ChunkJoiner');

const SelectFrom = require('./SelectFrom');

const DataSourceApiResolver = require('../DataSourceApiResolver');
const DataSourceResolversPool = require('../DataSourceResolversPool');

class Select
{
	constructor(select, dataSourceResolvers = [])
	{
		this.select = select;
		this.dataSourceApiResolver = new DataSourceApiResolver;

		this.dataSourceResolversPool = new DataSourceResolversPool;

		for (const resolver of dataSourceResolvers) {
			this.dataSourceResolversPool.add(resolver);
		}

		this.dataSourceResolversPool.add(this.dataSourceApiResolver);
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
