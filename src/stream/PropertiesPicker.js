const JlTransform = require('./JlTransform');

class PropertiesPicker extends JlTransform
{
	constructor()
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);
	}

	_transform(chunk, encoding, cb)
	{
		this.push(chunk);
		cb();
	}
}

module.exports = PropertiesPicker;
