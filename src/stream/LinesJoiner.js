const JlTransform = require('./JlTransform');

class LinesJoiner extends JlTransform
{
	constructor()
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.RAW);

		this.glue = '\n';

		this.empty = true;
	}

	_transform(chunk, encoding, cb)
	{
		this.push(chunk.join(this.glue));
		this.empty = false;

		cb();
	}

	_flush()
	{
		if (!this.empty) {
			// tailing \n
			this.push(this.glue);
		}
	}
}

module.exports = LinesJoiner;
