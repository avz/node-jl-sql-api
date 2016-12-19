'use strict';

const JlTransform = require('./JlTransform');
const AsyncUtils = require('../AsyncUtils');

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
		AsyncUtils.eachSeriesHalfSync(
			chunk,
			(row, done) => {
				const key = this.groupKeyGenerator(row);
				const keySerialized = this._serializeKey(key);

				/* TODO можно предварительно сравнивать сами значения без сериализации */

				if (keySerialized === this.currentKeySerialized) {
					this.aggregation.update(row, done);

					return;
				}

				this.currentKey = key;
				this.currentKeySerialized = keySerialized;

				/* группа поменялась или же это первая группа */

				if (!this.isFirstRow) {
					this.aggregation.result(result => {
						this.push([result]);
						this.aggregation.deinit();

						this.aggregation.init();
						this.aggregation.update(row, done);
					});

					return;

				} else {
					this.isFirstRow = false;
				}

				this.aggregation.init();
				this.aggregation.update(row, done);
			},
			cb
		);
	}

	_flush(cb)
	{
		if (!this.firstRow) {
			this.aggregation.result(result => {
				this.push([result]);
				this.aggregation.deinit();

				cb();
			});
		} else {
			cb();
		}
	}
}

module.exports = Groupper;
