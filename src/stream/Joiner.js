'use strict';

const JlTransform = require('./JlTransform');
const Readable = require('stream').Readable;
const Join = require('../Join');
const EventEmitter = require('events');
const ReadWriteTmpFileStream = require('./ReadWriteTmpFileStream');
const DeepCloner = require('../DeepCloner');

const JsonParser = require('./JsonParser');
const LinesSplitter = require('./LinesSplitter');

const ProgramError = require('../error/ProgramError');
const NotSupported = require('../error/NotSupported');

const Collator = require('../Collator');
const DataType = require('../DataType');

class Joiner extends Readable
{
	/**
	 *
	 * @param {Join} join
	 */
	constructor(preparingContext, join, mainValueCb, mainStreamSorted, joiningValueCb, joiningStreamSorted)
	{
		super({
			objectMode: true,
			highWaterMark: 1
		});

		this.preparingContext = preparingContext;

		this.inputType = JlTransform.ARRAYS_OF_OBJECTS;
		this.outputType = JlTransform.ARRAYS_OF_OBJECTS;

		this.join = join;

		this.mainValueCb = mainValueCb;
		this.joiningValueCb = joiningValueCb;

		this.currentKey = undefined;
		this.currentKeyMainRow = undefined;
		this.currentKeyBuffer = new Joiner.KeyBuffer(preparingContext);

		this.keyBufferFlusher = null;

		this.mainBuffer = new Joiner.InputBuffer(mainStreamSorted);
		this.joiningBuffer = new Joiner.InputBuffer(joiningStreamSorted);

		mainStreamSorted.on('error', (err) => {
			this.emit('error', err);
		});

		joiningStreamSorted.on('error', (err) => {
			this.emit('error', err);
		});
	}

	mainKey(row)
	{
		return Collator.generateGroupKey(DataType.STRING, this.mainValueCb(row));
	}

	joiningKey(row)
	{
		return Collator.generateGroupKey(DataType.STRING, this.joiningValueCb(row));
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
						this.currentKeyBuffer.push(joiningRow, () => {
							this.joiningBuffer.next();
							setImmediate(() => continueJoining(cb));
						});

					} else if (mainKey < joiningKey) {

						nextMainRow(cb);
					} else { // mainKey > joiningKey
						this.joiningBuffer.next();

						setImmediate(() => continueJoining(cb));
					}
				});
			};

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
		this.keyBufferFlusher = this.currentKeyBuffer.startFlush(
			this.currentKeyMainRow,
			this.join.joiningDataSourceName
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
					throw new ProgramError('Only one item handle is allowed');
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
			throw new ProgramError('shift behind end');
		}

		this.offset++;

		if (this.isEmpty()) {
			if (this.streamEnded) {
				setImmediate(() => {
					this.emit('end');
				});
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
};

Joiner.KeyBuffer = class Joiner_KeyBuffer
{
	constructor(preparingContext)
	{
		if (!preparingContext) {
			throw new Error();
		}

		this.preparingContext = preparingContext;
		this.items = [];
		this.maxInMemorySize = preparingContext.options.joinOptions.maxKeysInMemory;
		this.forceInMemory = preparingContext.options.joinOptions.forceInMemory;

		this.fileStorage = null;
	}

	push(item, cb)
	{
		if (this.fileStorage) {
			this._pushToFileStorage(item, cb);

			return;
		}

		this.items.push(item);

		if (!this.forceInMemory && this.items.length > this.maxInMemorySize) {
			this._convertToFileStorage(cb);
		} else {
			cb();
		}
	}

	_pushToFileStorage(row, cb)
	{
		this.fileStorage.write(row, cb);
	}

	_convertToFileStorage(cb)
	{
		const tmpdir = this.preparingContext.options.joinOptions.tmpDir || require('os').tmpdir();

		this.fileStorage = new Joiner.KeyBufferFileStorage(tmpdir, this.items);
		this.items = [];
		this.fileStorage.once('create', cb);
	}

	clear()
	{
		this.items = [];

		if (this.fileStorage) {
			this.fileStorage.closeSync();
			this.fileStorage = null;
		}
	}

	isEmpty()
	{
		return !(this.items.length || this.fileStorage);
	}

	read(lastOffset, cb)
	{
		if (this.fileStorage) {
			this._readFileStorage(lastOffset, cb);

			return;
		}

		throw new NotSupported;
	}

	_readFileStorage(readable, cb)
	{
		let stream = readable;

		if (!stream) {
			stream = this.fileStorage.createReadStream();
			stream.on('end', () => {
				stream.ended = true;

				if (stream.endHandler) {
					stream.endHandler();
				}
			});
		}

		if (stream.ended) {
			cb(null, stream);
		} else {
			stream.endHandler = () => {
				stream.endHandler = null;
				cb(null, stream);
			};

			stream.once('data', (rows) => {
				stream.endHandler = null;
				cb(rows, stream);
			});
		}
	}

	startFlush(mainRow, joiningSourceName)
	{
		if (this.fileStorage) {
			return new Joiner.KeyBufferFlusher_External(
				mainRow,
				joiningSourceName,
				this,
				1000
			);
		}

		return new Joiner.KeyBufferFlusher_InMemory(
			mainRow,
			joiningSourceName,
			this.items,
			1000
		);
	}
};

Joiner.KeyBufferFileStorage = class Joiner_KeyBufferFileStorage extends EventEmitter
{
	constructor(tmpdir, items)
	{
		super();

		this.file = new ReadWriteTmpFileStream('join_', tmpdir);

		this.file.once('open', () => {
			this.file.write(items.map(JSON.stringify).join('\n') + '\n', err => {
				if (err) {
					throw err;
				}

				this.emit('create');
			});
		});
	}

	write(row, cb)
	{
		this.file.write(JSON.stringify(row) + '\n', cb);
	}

	createReadStream()
	{
		return this.file.createReadStream().pipe(new LinesSplitter).pipe(new JsonParser);
	}

	closeSync()
	{
		this.file.closeSync();
	}
};

Joiner.KeyBufferFlusher_InMemory = class Joiner_KeyBufferFlusher_InMemory
{
	constructor(mainRow, joiningSourceName, items, chunkSize)
	{
		this.mainRow = mainRow;
		this.joiningSourceName = joiningSourceName;
		this.items = items;
		this.offset = 0;
		this.chunkSize = chunkSize;
	}

	readChunk(cb)
	{
		const chunk = [];

		for (; this.offset < this.items.length; this.offset++) {
			const joiningRow = this.items[this.offset];

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
		const merged = DeepCloner.clone(mainRow);

		merged.sources[this.joiningSourceName] = joiningRow.sources[this.joiningSourceName];

		return merged;
	}
};

Joiner.KeyBufferFlusher_External = class Joiner_KeyBufferFlusher
{
	constructor(mainRow, joiningSourceName, keyBuffer, chunkSize)
	{
		this.mainRow = mainRow;
		this.joiningSourceName = joiningSourceName;
		this.keyBuffer = keyBuffer;
		this.chunkSize = chunkSize;

		this.lastOffset = null;
	}

	readChunk(cb)
	{
		const chunk = [];

		const popNext = () => {
			this.keyBuffer.read(this.lastOffset, (joiningRows, offset) => {
				this.lastOffset = offset;

				if (!joiningRows) {
					if (chunk.length) {
						cb(chunk);
					} else {
						cb(null);
					}

					return;
				}

				for (const joiningRow of joiningRows) {
					chunk.push(this.mergeRows(this.mainRow, joiningRow));
				}

				if (chunk.length >= this.chunkSize) {
					cb(chunk);

					return;
				}

				setImmediate(popNext);
			});
		};

		popNext();
	}

	mergeRows(mainRow, joiningRow)
	{
		const merged = DeepCloner.clone(mainRow);

		merged.sources[this.joiningSourceName] = joiningRow.sources[this.joiningSourceName];

		return merged;
	}
};

module.exports = Joiner;
