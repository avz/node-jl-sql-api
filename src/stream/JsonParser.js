'use strict';

const JlTransform = require('./JlTransform');
const JsonParsingError = require('../error/JsonParsingError');

class JsonParser extends JlTransform
{
	constructor()
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);
	}

	_transform(chunk, encoding, cb)
	{
		var parsed = [];

		for (var i = 0; i < chunk.length; i++) {
			const json = chunk[i];

			try {
				parsed.push(JSON.parse(' ' + json));
			} catch (e) {
				if (/^\s+$/.test(json)) {
					continue;
				}

				this.emit('error', new JsonParsingError(e.message, chunk[i]));
			}
		}

		if (parsed.length) {
			this.push(parsed);
		}

		cb();
	}
}

module.exports = JsonParser;
