const JlTransform = require('./JlTransform');
const Readable = require('stream').Readable;
const Join = require('../Join');
const EventEmitter = require('events');

class Joiner extends Readable
{
	/**
	 *
	 * @param {Join} join
	 */
	constructor(join, mainValueCb, mainStreamSorted, joiningValueCb, joiningStreamSorted)
	{
		super({
			objectMode: true,
			highWaterMark: 1
		});

		this.inputType = JlTransform.ARRAYS_OF_OBJECTS;
		this.outputType = JlTransform.ARRAYS_OF_OBJECTS;

		this.join = join;

		this.mainValueCb = mainValueCb;
		this.joiningValueCb = joiningValueCb;

		this.currentKey = undefined;
		this.currentKeyMainRow = undefined;
		this.currentKeyBuffer = new Joiner.KeyBuffer;

		this.keyBufferFlusher = null;

		this.mainBuffer = new Joiner.InputBuffer(mainStreamSorted);
		this.joiningBuffer = new Joiner.InputBuffer(joiningStreamSorted);
	}

	mainKey(row)
	{
		const v = this.mainValueCb(row);
		return v === undefined ? '' : JSON.stringify(v + '');
	}

	joiningKey(row)
	{
		const v = this.joiningValueCb(row);
		return v === undefined ? '' : JSON.stringify(v + '');
	}

	popOutput(cb)
	{
		this.mainBuffer.head(mainRow => {
			const nextMainRow = (cb) => {
				this.mainBuffer.next();

				if (!this.currentKeyBuffer.isEmpty()) {
					this.startFlushKeyBuffer(cb);
				} else if (this.join.type === Join.LEFT) {
					cb([mainRow]);
				} else {
					this.readNextChunk(cb);
				}
			};

			if (!mainRow) {
				cb(null);
				return;
			}

			const mainKey = this.mainKey(mainRow);

			if (this.currentKeyMainRow !== mainRow) {
				this.currentKeyMainRow = mainRow;

				if (this.currentKey === mainKey) {
					nextMainRow(cb);
					return;
				}

				this.currentKey = mainKey;
				this.currentKeyBuffer.clear();
			}

			const continueJoining = (cb) => {
				this.joiningBuffer.head((joiningRow) => {
					if (!joiningRow) {
						nextMainRow(cb);
						return;
					}

					const joiningKey = this.joiningKey(joiningRow);

					if (mainKey === joiningKey) {
						this.currentKeyBuffer.push(joiningRow);

						this.joiningBuffer.next();
						setImmediate(() => continueJoining(cb));

					} else if (joiningKey > mainKey) {

						nextMainRow(cb);
					} else { // mainKey > joiningKey
						this.joiningBuffer.next();

						setImmediate(() => continueJoining(cb));
					}
				})
			}

			continueJoining(cb);
		});
	}

	readNextChunk(cb)
	{
		setImmediate(() => {
			if (this.keyBufferFlusher) {
				this.flushKeyBufferChunk(cb);
			} else {
				this.popOutput(cb);
			}
		});
	}

	_read()
	{
		this.readNextChunk(rows => {
			this.push(rows);
		});
	}

	startFlushKeyBuffer(cb)
	{
		this.keyBufferFlusher = new Joiner.KeyBufferFlusher(
			this.currentKeyMainRow,
			this.join.joiningDataStream.name,
			this.currentKeyBuffer,
			1000
		);
		this.flushKeyBufferChunk(cb);
	}

	flushKeyBufferChunk(cb)
	{
		this.keyBufferFlusher.readChunk(chunk => {
			if (chunk === null) {
				// буфер кончился, надо читать дальше
				this.keyBufferFlusher = null;
				this.readNextChunk(cb);
				return;
			}

			cb(chunk);
		});
	}
}

Joiner.InputBuffer = class Joiner_InputBuffer extends EventEmitter
{
	constructor(readableStream, maxSize = 16)
	{
		super();

		this.stream = readableStream;
		this.maxSize = maxSize;
		this.items = [];
		this.offset = 0;

		this.streamEnded = false;
		this.ended = false;

		this.itemHandler = null;

		this.stream.on('end', () => {
			this.streamEnded = true;

			if (this.itemHandler) {
				const itemHandler = this.itemHandler;
				this.itemHandler = null;

				this.head(itemHandler);
			}
		});

		this.stream.on('data', data => {
			if (this.isEmpty()) {
				this.offset = 0;
				this.items = data;
			}

			if (this.items.length > this.maxSize) {
				this.stream.pause();
			}

			if (this.itemHandler) {
				const itemHandler = this.itemHandler;
				this.itemHandler = null;

				this.head(itemHandler);
			}
		});
	}

	head(cb)
	{
		if (this.isEmpty()) {
			if (this.streamEnded) {
				cb(null);
			} else {
				if (this.itemHandler) {
					throw new Error('Only one item handle is allowed');
				}

				this.itemHandler = cb;
			}

		} else {
			cb(this.items[this.offset]);
		}
	}

	next()
	{
		if (this.offset + 1 > this.items.length) {
			throw new Error('shift behind end');
		}

		this.offset++;

		if (this.isEmpty()) {
			if (this.streamEnded) {
				setImmediate(() => {
					this.emit('end');
				})
			} else {
				this.stream.resume();
			}
		}
	}

	isEmpty()
	{
		return this.offset >= this.items.length;
	}

	isEnded()
	{
		return this.streamEnded && this.isEmpty();
	}

	_optimize()
	{
		this.items = this.items.slice(this.offset);
		this.offset = 0;
	}
}

Joiner.KeyBuffer = class Joiner_KeyBuffer
{
	constructor()
	{
		this.items = [];
	}

	push(item)
	{
		this.items.push(item);
	}

	clear()
	{
		this.items = [];
	}

	isEmpty()
	{
		return !this.items.length;
	}
}

Joiner.KeyBufferFlusher = class Joiner_KeyBufferFlusher
{
	constructor(mainRow, joiningStreamName, keyBuffer, chunkSize)
	{
		this.mainRow = mainRow;
		this.joiningStreamName = joiningStreamName;
		this.keyBuffer = keyBuffer;
		this.offset = 0;
		this.chunkSize = chunkSize;
	}

	readChunk(cb)
	{
		const chunk = [];

		for (; this.offset < this.keyBuffer.items.length; this.offset++) {
			const joiningRow = this.keyBuffer.items[this.offset];

			chunk.push(this.mergeRows(this.mainRow, joiningRow));

			if (chunk.length >= this.chunkSize) {
				break;
			}
		}

		if (!chunk.length) {
			cb(null);
			return;
		}

		cb(chunk);
	}

	mergeRows(mainRow, joiningRow)
	{
		const merged = JSON.parse(JSON.stringify(mainRow));

		merged.sources[this.joiningStreamName] = joiningRow.sources[this.joiningStreamName];

		return merged;
	}
}

module.exports = Joiner;
