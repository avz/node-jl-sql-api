'use strict';

const JlTransform = require('./JlTransform');
const JsonBorderExplorer = require('../json/JsonBorderExplorer');

class JsonSplitter extends JlTransform
{
	constructor()
	{
		super(JlTransform.RAW, JlTransform.ARRAYS_OF_OBJECTS);

		this.head = [];
		this.explorer = new JsonBorderExplorer;
	}

	_transform(buf, enc, cb)
	{
		var off = 0;
		var lastOff = 0;

		const jsons = [];

		while ((off = this.explorer.write(buf, off)) !== -1) {
			if (this.head.length) {
				// нашли конец объекта, который начался в прошлых чанках
				this.head.push(buf.slice(0, off));

				jsons.push([Buffer.concat(this.head).toString()]);

				this.head = [];
				lastOff = off;

				continue;
			}

			const json = buf.toString('utf8', lastOff, off);

			jsons.push(json);

			lastOff = off;
		}

		this.head.push(buf.slice(lastOff));

		if (jsons.length) {
			this.push(jsons);
		}

		cb();
	}

	_flush(cb)
	{
		const off = this.explorer.end();

		if (off === -1) {
			cb();

			return;
		}

		if (this.head.length) {
			this.push([Buffer.concat(this.head).toString()]);
			this.head = [];
		}

		cb();
	}
}

module.exports = JsonSplitter;
