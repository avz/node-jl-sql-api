'use strict';

const JlTransform = require('./JlTransform');
const PropertiesPicker = require('../PropertiesPicker');
const DataRow = require('../DataRow');
const DeepCloner = require('../DeepCloner');

class PropertiesPickerTransformer extends JlTransform
{
	constructor(paths, makeClone = false, updateIfCb = null)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.propertiesPicker = new PropertiesPicker(paths);
		this.makeClone = !!makeClone;
		this.updateIfCb = updateIfCb;
	}

	_transform(chunk, encoding, cb)
	{
		var result = [];

		for (let i = 0; i < chunk.length; i++) {
			const row = chunk[i];

			if (this.updateIfCb && !this.updateIfCb(row)) {
				result.push(row);
				continue;
			}

			if (this.makeClone) {
				const dest = DeepCloner.clone(row);

				this.propertiesPicker.mergeProperties(row, dest.sources);

				result.push(dest);
			} else {
				const dest = new DataRow(null);

				dest.sources = this.propertiesPicker.sliceProperties(row);

				result.push(dest);
			}
		}

		this.push(result);

		cb();
	}
}

module.exports = PropertiesPickerTransformer;
