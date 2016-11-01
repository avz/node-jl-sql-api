const JlTransform = require('./JlTransform');

class JlPassThrough extends JlTransform
{
	_transform(chunk, charset, cb)
	{
		this.push(chunk);
		cb();
	}

	_flush(cb)
	{
		cb();
	}
}

module.exports = JlPassThrough;
