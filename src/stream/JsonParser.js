const JlTransform = require('./JlTransform');

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
			if (/^\s*$/.test(json)) {
				continue;
			}

			parsed.push(JSON.parse(' ' + json));
		}

		if (parsed.length) {
			this.push(parsed);
		}

		cb();
	}
}

module.exports = JsonParser;
