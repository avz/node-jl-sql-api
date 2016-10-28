const JlTransform = require('./JlTransform');

class LinesSplitter extends JlTransform
{
	constructor()
	{
		super(JlTransform.RAW, JlTransform.ARRAYS_OF_OBJECTS);

		this.ending = '\n';
		this.tail = '';
	}

	_transform(chunk, encoding, cb)
	{
		var lines = ('' + chunk).split(this.ending);

		var bucket = [];

		if(lines.length > 1) {
			bucket.push(this.tail + lines[0]);

			for(var i = 1; i < lines.length - 1; i++) {
				bucket.push(lines[i]);
			}

			this.tail = lines[lines.length - 1];
		} else {
			this.tail += lines[lines.length - 1];
		}

		if(bucket.length)
			this.push(bucket);

		cb();
	}

	_flush(cb)
	{
		if(this.tail.length) {
			this.push([this.tail]);
			this.tail = '';
		}

		cb();
	}
}

module.exports = LinesSplitter;
