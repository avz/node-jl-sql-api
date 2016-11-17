'use strict';

const assert = require('assert');
const JlTransformsChain = require('../../../src/stream/JlTransformsChain');
const Readable = require('stream').Readable;
const PassThrough = require('stream').PassThrough;

class SlowConsumer
{
	constructor(readableStream)
	{
		this.consumed = 0;

		readableStream.on('readable', () => {
			const reader = () => {
				let d;

				while ((d = readableStream.read())) {
					if (d) {
						this.consumed++;
					}
				}
			};

			setTimeout(reader, 1);
		});
	}
}

class Producer extends Readable
{
	constructor()
	{
		super({objectMode: true, highWaterMark: 1});

		this.produced = 0;
		this.ended = false;
		this.max = 10000;
		this.overflow = false;
	}

	end()
	{
		this.push(null);
		this.ended = true;
	}

	_read()
	{
		if (this.produced >= this.max) {
			this.end();
			this.overflow = true;
		}

		process.nextTick(() => {
			if (this.ended) {
				return;
			}

			this.push(Date.now());
			this.produced++;
		});
	}
}

describe('JlTransformsChain', () => {
	it('back pressure', (done) => {
		const producer = new Producer;
		const chain = new JlTransformsChain([producer, new PassThrough({objectMode: true, highWaterMark: 1})]);
		const consumer = new SlowConsumer(chain);

		setTimeout(() => {
			producer.end();
			assert.ok(producer.overflow === false);

			chain.on('end', () => {
				assert.ok(producer.produced - consumer.consumed < 100);
				done();
			});
		}, 10);
	});

	it('proxy \'error\' event', (done) => {
		const error = new Error('test error');

		const errorStream = new Readable({
			read() {
				errorStream.emit('error', error);
			}
		});

		const chain = new JlTransformsChain([errorStream, new PassThrough]);

		chain.on('error', function(err) {
			assert.strictEqual(err, error);
			done();
		});
	});
});
