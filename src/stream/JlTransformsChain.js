const JlTransform = require('./JlTransform');
const Transform = require('stream').Transform;

class JlTransformsChain extends JlTransform
{
	constructor(streams = [])
	{
		super(JlTransform.ANY, JlTransform.ANY);

		this.firstStream = null;
		this.lastStream = null;

		for (const stream of streams) {
			this.append(stream);
		}

		this.lastStream.on('data', (data) => {
			if (!this.push(data)) {
				this.lastStream.pause();
			}
		});

		this.lastStream.on('end', () => {
			this.emit('end');
		});
	}

	_read(...args)
	{
		if (this.lastStream.isPaused()) {
			this.lastStream.resume();
		}

		return super._read(...args);
	}

	_transform(chunk, encoding, cb)
	{
		this.firstStream.write(chunk, encoding, cb);
	}

	_flush(cb)
	{
		this.firstStream.end(cb);
	}

	isEmpty()
	{
		return !this.firstStream;
	}

	append(stream)
	{
		if (!this.firstStream) {
			this.firstStream = stream;

			if (stream.outputType) {
				this.inputType = stream.inputType;
			}
		} else {
			this.lastStream.pipe(stream);
		}

		this.lastStream = stream;

		if (stream.outputType) {
			this.outputType = stream.outputType;
		}
	}
//
//	pipe(stream)
//	{
//		return this.lastStream.pipe(stream);
//	}
}

module.exports = JlTransformsChain;
