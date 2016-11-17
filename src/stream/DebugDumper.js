'use strict';

const JlTransform = require('./JlTransform');

class DebugDumper extends JlTransform
{
	constructor(dumpCb = console.log)
	{
		super(JlTransform.ANY, JlTransform.ANY);

		this.dumper = dumpCb

		this.on('pipe', pipe => {
			this.inputType = pipe.outputType;
			this.outputType = pipe.outputType;
		});
	}

	_transform(chunk, encoding, cb)
	{
		this.dumper(chunk);
		this.push(chunk);

		cb();
	}
}

module.exports = DebugDumper;
