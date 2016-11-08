const JlTransform = require('./JlTransform');
const PropertiesPicker = require('../PropertiesPicker');
const DataRow = require('../DataRow');

class PropertiesPickerTransformer extends JlTransform
{
	constructor(paths)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.paths = paths;
		this.propertiesPicker = new PropertiesPicker;
	}

	_transform(chunk, encoding, cb)
	{
		var result = [];

		for (let i = 0; i < chunk.length; i++) {
			var dest = new DataRow({});

			this.propertiesPicker.copyProperties(this.paths, chunk[i], dest.sources);

			result.push(dest);
		}

		this.push(result);

		cb();
	}
}

module.exports = PropertiesPickerTransformer;
