'use strict';

const JlTransform = require('./JlTransform');

class Append extends JlTransform
{
	constructor(rows)
	{
		super(JlTransform.ARRAY_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.tail = rows;
	}

	_transform(objects, charset, cb)
	{
		this.push(objects);

		cb();
	}

	_flush(cb)
	{
		this.push(this.tail);

		cb();
	}
}

module.exports = Append;
