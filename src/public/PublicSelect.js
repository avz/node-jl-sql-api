'use strict';

const JlTransform = require('../stream/JlTransform');
const JlPassThrough = require('../stream/JlPassThrough');
const JlTransformsChain = require('../stream/JlTransformsChain');

const JsonParser = require('../stream/JsonParser');
const LinesSplitter = require('../stream/LinesSplitter');
const ChunkJoiner = require('../stream/ChunkJoiner');

const PublicSelectFrom = require('./PublicSelectFrom');

const DataSourceApiResolver = require('../DataSourceApiResolver');
const DataSourceResolversPool = require('../DataSourceResolversPool');

const Binder = require('../Binder');

class PublicSelect
{
	/**
	 *
	 * @param {Select} select
	 * @param {DataSourceResolver[]} dataSourceResolvers
	 * @returns {PublicSelect}
	 */
	constructor(select, dataSourceResolvers = [])
	{
		this.select = select;
		this.binder = new Binder;
		this.dataSourceApiResolver = new DataSourceApiResolver;

		this.dataSourceResolversPool = new DataSourceResolversPool;

		for (const resolver of dataSourceResolvers) {
			this.dataSourceResolversPool.add(resolver);
		}

		this.dataSourceResolversPool.add(this.dataSourceApiResolver);
	}

	/**
	 *
	 * @param {string} ident
	 * @param {mixed} value
	 * @returns {this|PublicSelect}
	 */
	bind(ident, value)
	{
		this.binder.bind(ident, value);

		return this;
	}

	/**
	 * @param {Readable} input
	 * @returns {PublicSelectFrom}
	 */
	_selectFrom(input)
	{
		this.binder.expandInplace(this.select.ast);

		return new PublicSelectFrom(this, this.select, input);
	}

	/**
	 *
	 * @param {Readable} stream
	 * @returns {PublicSelectFrom}
	 */
	fromJsonStream(stream)
	{
		const chain = [new LinesSplitter, new JsonParser];

		if (stream) {
			chain.unshift(stream);
		}

		const input = new JlTransformsChain(chain);

		return this._selectFrom(input);
	}

	/**
	 *
	 * @param {Readable} stream
	 * @returns {PublicSelectFrom}
	 */
	fromObjectsStream(stream)
	{
		var input = new ChunkJoiner;

		if (stream) {
			input = new JlTransformsChain([stream, input]);
		}

		return this._selectFrom(input);
	}

	/**
	 *
	 * @param {ReadableStream} stream
	 * @returns {PublicSelectFrom}
	 */
	fromArrayOfObjects(array)
	{
		const stream = new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		stream.end(array);

		return this._selectFrom(stream);
	}
}

module.exports = PublicSelect;
