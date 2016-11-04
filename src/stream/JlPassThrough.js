const JlTransform = require('./JlTransform');

class JlPassThrough extends JlTransform
{
	_transform(chunk, charset, cb)
	{
		cb(null, chunk);
	}

	_flush(cb)
	{
		cb();
	}
}

module.exports = JlPassThrough;
