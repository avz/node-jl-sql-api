const JlTransform = require('./JlTransform');

class JlTransformsChain extends JlTransform
{
	constructor()
	{
		super(JlTransform.ANY, JlTransform.ANY);

		this.firstStream = null;
		this.lastStream = null;
	}

	_transform(chunk, encoding, cb)
	{
		this.firstStream.write(chunk, encoding, cb);
	}

	_flush(cb)
	{
		this.firstStream.end(cb);
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

	pipe(stream)
	{
		return this.lastStream.pipe(stream);
	}
}

module.exports = JlTransformsChain;
