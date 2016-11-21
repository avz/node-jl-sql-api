'use strict';

const JlTransform = require('./JlTransform');

class Groupper extends JlTransform
{
	constructor(groupKeyGenerator, aggregation)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.groupKeyGenerator = groupKeyGenerator;
		this.aggregation = aggregation;

		this.isFirstRow = true;

		this.currentKey = null;
		this.currentKeySerialized = null;
		this.lastRow = null;
	}

	_serializeKey(key)
	{
		const type = typeof(key);

		/* eslint-disable no-unreachable, indent */

		switch (type) {
			case 'string':
				// protect from collision with valid JSON object key
				return '"""' + key;
			break;
			case 'number':
			case 'boolean':
			case 'undefined':
				return key;
			break;

			default:
				if (key === null) {
					return null;
				}

				return JSON.stringify(key);
			break;
		}

		/* eslint-enable no-unreachable, indent */
	}

	_transform(chunk, encoding, cb)
	{
		for (let i = 0; i < chunk.length; i++) {
			const row = chunk[i];

			const key = this.groupKeyGenerator(row);

			if (this._serializeKey(key) === this.currentKeySerialized) {
				this.aggregation.update(row);
				this.currentKey = key;

				continue;
			}

			/* группа поменялась или же это первая группа */

			if (!this.isFirstRow) {
				this.push([this.aggregation.result()]);
				this.aggregation.deinit();
			} else {
				this.isFirstRow = false;
			}

			this.currentKey = key;
			this.currentKeySerialized = this._serializeKey(this.currentKey);

			this.aggregation.init();
			this.aggregation.update(row);
		}

		cb();
	}

	_flush(cb)
	{
		if (!this.firstRow) {
			this.push([this.aggregation.result()]);
			this.aggregation.deinit();
		}

		cb();
	}
}

module.exports = Groupper;
