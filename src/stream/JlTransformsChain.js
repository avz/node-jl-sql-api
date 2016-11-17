'use strict';

const Transform = require('stream').Transform;
const JlTransform = require('./JlTransform');

class JlTransformsChain extends Transform
{
	constructor(streams = null)
	{
		super({
			objectMode: true,
			highWaterMark: 1
		});

		this.inputType = JlTransform.ANY;
		this.outputType = JlTransform.ANY;

		this.streams = [];
		this.firstStream = null;
		this.lastStream = null;

		if (streams) {
			this.init(streams);
		}
	}

	init(streams)
	{
		this.streams = streams;
		this.firstStream = streams[0];
		this.lastStream = streams[streams.length - 1];

		this.lastStream.on('end', () => {
			this.push(null);
		});

		this.lastStream.on('data', (d) => {
			if (!this.push(d)) {
				this.lastStream.pause();
			}
		});

		for (let i = 0; i < streams.length - 1; i++) {
			if (streams[i].isTerminator || streams[i + 1].isTerminator) {
				continue;
			}

			streams[i].on('error', e => {
				this.emit('error', e);
			});

			streams[i].pipe(streams[i + 1]);
		}
	}

	_transform(chunk, encoding, callback)
	{
		this.firstStream.write(chunk, encoding, callback);
	}

	_flush(cb)
	{
		this.lastStream.once('end', cb);
		this.firstStream.end();
	}

	_read(...args)
	{
		super._read(...args);

		if (this.lastStream.isPaused()) {
			this.lastStream.resume();
		}
	}
}

module.exports = JlTransformsChain;
