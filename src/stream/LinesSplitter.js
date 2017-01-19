'use strict';

const JlTransform = require('./JlTransform');

class LinesSplitter extends JlTransform
{
	constructor()
	{
		super(JlTransform.RAW, JlTransform.ARRAYS_OF_OBJECTS);

		this.ending = '\n';
		this.endingCode = 0x0a;

		this.tail = Buffer.alloc(0);
	}

	_transform(chunk, encoding, cb)
	{
		const lastLineBreakPos = chunk.lastIndexOf(this.endingCode);

		if (lastLineBreakPos === -1) {
			if (this.tail.length) {
				this.tail = Buffer.concat([this.tail, chunk]);
			} else {
				this.tail = chunk;
			}

			cb();

			return;
		}

		const chunkWoTail = chunk.slice(0, lastLineBreakPos);
		const body = Buffer.concat([this.tail, chunkWoTail]).toString();

		this.tail = chunk.slice(lastLineBreakPos + 1);

		const lines = body.split(this.ending);

		const bucket = [];

		for (const line of lines) {
			if (line.length) {
				bucket.push(line);
			}
		}

		if (bucket.length) {
			this.push(bucket);
		}

		cb();
	}

	_flush(cb)
	{
		if (this.tail.length) {
			this.push([this.tail]);
			this.tail = '';
		}

		cb();
	}
}

module.exports = LinesSplitter;
