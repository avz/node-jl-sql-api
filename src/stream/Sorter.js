'use strict';

const SorterInMemory = require('./SorterInMemory');
const SorterExternal = require('./SorterExternal');
const JlTransform = require('./JlTransform');

class Sorter extends JlTransform
{
	/**
	 * @param {Order[]} orders
	 * @param {SortOptions} options
	 */
	constructor(orders, options)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.orders = orders;
		this.options = options;

		this.inMemory = new SorterInMemory(orders, options);
		this.external = null;

		this.flushCb = null;

		this.stream = null;

		this._handleStream(this.inMemory);
	}

	_handleStream(stream)
	{
		this.stream = stream;
		stream.on('data', this._onStreamData.bind(this));
		stream.on('end', this._onStreamEnd.bind(this));
	}

	_onStreamData(data)
	{
		const flushed = this.push(data);

		if (!flushed) {
			this.stream.pause();
		}
	}

	_onStreamEnd()
	{
		this.flushCb();
	}

	_convertToExternal(cb)
	{
		const external = new SorterExternal(this.orders, this.options);
		const inMemoryBuffer = this.inMemory.buffer();

		this.inMemory.clear();
		this._handleStream(external);
		this.inMemory = null;
		this.external = external;

		external.write(inMemoryBuffer, null, cb);
	}

	_transform(chunk, encoding, cb)
	{
		if (this.inMemory) {
			this.inMemory.write(chunk);

			if (!this.options.forceInMemory && this.inMemory.bufferSize() > this.options.inMemoryBufferSize) {
				this._convertToExternal(cb);
			} else {
				cb();
			}
		} else {
			this.external.write(chunk, encoding, cb);
		}
	}

	_flush(cb)
	{
		if (this.inMemory) {
			this.inMemory.end();
		} else {
			this.external.end();
		}

		this.flushCb = cb;
	}

	_read(...args)
	{
		super._read(...args);

		if (this.stream.isPaused()) {
			this.stream.resume();
		}
	}
}

module.exports = Sorter;
