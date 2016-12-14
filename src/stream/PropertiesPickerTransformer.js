'use strict';

const JlTransform = require('./JlTransform');
const PropertiesPicker = require('../PropertiesPicker');
const DataRow = require('../DataRow');
const DeepCloner = require('../DeepCloner');

class PropertiesPickerTransformer extends JlTransform
{
	constructor(paths, makeClone = false)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.propertiesPicker = new PropertiesPicker(paths);
		this.makeClone = !!makeClone;
	}

	_transform(chunk, encoding, cb)
	{
		var result = [];

		for (let i = 0; i < chunk.length; i++) {
			if (this.makeClone) {
				const dest = DeepCloner.clone(chunk[i]);

				this.propertiesPicker.mergeProperties(chunk[i], dest.sources);

				result.push(dest);
			} else {
				const dest = new DataRow(null);

				dest.sources = this.propertiesPicker.sliceProperties(chunk[i]);

				result.push(dest);
			}
		}

		this.push(result);

		cb();
	}
}

module.exports = PropertiesPickerTransformer;
