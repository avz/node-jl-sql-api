'use strict';

const AggregationFunctionAsync = require('../../AggregationFunctionAsync');
const DataType = require('../../DataType');
const Collator = require('../../Collator');
const SortWrapper = require('../../external/sort/SortWrapper');
const WcWrapper = require('../../external/WcWrapper');
const EventEmitter = require('events');

class ExternalUniqueCounter extends EventEmitter
{
	constructor(sortOptions)
	{
		super();

		const sort = new SortWrapper({
			unique: true,
			tmpDir: sortOptions.tmpDir,
			bufferSize: sortOptions.bufferSize
		});

		const wc = new WcWrapper;

		sort.stdout.pipe(wc.stdin);

		let linesCountString = '\n';

		wc.stdout.on('data', (data) => {
			linesCountString += data;
		});

		wc.stdout.once('end', () => {
			const count = parseInt(linesCountString, 10);

			this.emit('end', count);
		});

		this.sort = sort;
	}

	pushMap(keysMap, cb)
	{
		let chunk = '';

		for (const [key] of keysMap) {
			chunk += key + '\n';
		}

		this.sort.stdin.write(chunk, cb);
	}

	pushEnd(cb)
	{
		this.once('end', cb);
		this.sort.stdin.end();
	}
}

class COUNT_DISTINCT extends AggregationFunctionAsync
{
	constructor(...args)
	{
		super(...args);

		this.externalUniqueCounter = null;
		this.keys = new Map;

		this.maxKeysInMemory = this.preparingContext.options.sortOptions.inMemoryBufferSize;
		this.forceInMemory = this.preparingContext.options.sortOptions.forceInMemory;
	}

	_externalUniqueCounter()
	{
		if (!this.externalUniqueCounter) {
			this.externalUniqueCounter = new ExternalUniqueCounter(this.preparingContext.options.sortOptions);
		}

		return this.externalUniqueCounter;
	}

	static dataType()
	{
		return DataType.NUMBER;
	}

	init()
	{
	}

	updateAsync(args, done)
	{
		if (args[0] === undefined || args[0] === null) {
			done();

			return;
		}

		this.keys.set(Collator.generateGroupKey(DataType.MIXED, args[0]), 1);

		if (this.keys.size > this.maxKeysInMemory) {
			this._externalUniqueCounter().pushMap(this.keys, done);
			this.keys.clear();
		} else {
			done();
		}
	}

	resultAsync(done)
	{
		if (!this.externalUniqueCounter) {
			done(this.keys.size);

			return;
		}

		this._externalUniqueCounter().pushMap(this.keys, () => {
			this._externalUniqueCounter().pushEnd(done);
		});
	}

	deinit()
	{
		this.keys.clear();
		this.externalUniqueCounter = null;
	}
}

module.exports = COUNT_DISTINCT;
