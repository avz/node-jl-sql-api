'use strict';

const JlTransform = require('../stream/JlTransform');
const JlPassThrough = require('../stream/JlPassThrough');
const JlTransformsChain = require('../stream/JlTransformsChain');

const JsonParser = require('../stream/JsonParser');
const JsonSplitter = require('../stream/JsonSplitter');
const ChunkJoiner = require('../stream/ChunkJoiner');

const PublicSelectFrom = require('./PublicSelectFrom');

const Binder = require('../Binder');

class PublicSelect
{
	/**
	 *
	 * @param {Select} select
	 * @param {DataSourceApiResolver} dataSourceApiResolver
	 * @returns {PublicSelect}
	 */
	constructor(select, dataSourceApiResolver)
	{
		this.select = select;
		this.binder = new Binder;
		this.dataSourceApiResolver = dataSourceApiResolver;
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
		const chain = [new JsonSplitter, new JsonParser];

		if (stream) {
			chain.unshift(stream);
		}

		const input = new JlTransformsChain(chain);

		return this._selectFrom(input);
	}

	/**
	 * Empty stream to support FROM clause
	 * @returns {PublicSelectFrom}
	 */
	fromEmptyStream()
	{
		const stream = new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		stream.end();

		return this._selectFrom(stream);
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
