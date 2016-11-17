'use strict';

const JlTransform = require('./JlTransform');

class Filter extends JlTransform
{
	constructor(filterCb)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.filter = filterCb;
	}

	_transform(chunk, encoding, cb)
	{
		var result = [];

		for (let i = 0; i < chunk.length; i++) {
			if (this.filter(chunk[i])) {
				result.push(chunk[i]);
			}
		}

		if (result.length) {
			this.push(result);
		}

		cb();
	}
}

module.exports = Filter;
