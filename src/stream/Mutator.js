'use strict';

const JlTransform = require('./JlTransform');

class Mutator extends JlTransform
{
	constructor(func)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.func = func;
	}

	_transform(chunk, encoding, cb)
	{
		var result = [];

		for (const row of chunk) {
			result.push(this.func(row));
		}

		this.push(result);

		cb();
	}
}

module.exports = Mutator;
