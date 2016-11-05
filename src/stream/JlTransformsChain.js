const Duplex = require('stream').Duplex;
const Transform = require('stream').Transform;
const JlTransform = require('./JlTransform');

class JlTransformsChain extends Transform
{
	constructor(streams)
	{
		super({
			objectMode: true
		});

		this.inputType = JlTransform.ANY;
		this.outputType = JlTransform.ANY;

		this.firstStream = streams[0];
		this.lastStream = streams[streams.length - 1];

		for (let i = 0; i < streams.length - 1; i++) {
			streams[i].pipe(streams[i + 1]);
		}

		this.lastStream.on('end', () => {
			this.emit('end');
		});

		this.lastStream.on('data', (d) => {
			if (!this.push(d)) {
				this.lastStream.pause();
			}
		});
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
