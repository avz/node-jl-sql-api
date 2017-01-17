'use strict';

const JlTransform = require('./JlTransform');
const AsyncUtils = require('../AsyncUtils');
const Collator = require('../Collator');
const DataType = require('../DataType');

class Groupper extends JlTransform
{
	constructor(groupKeyGenerator, aggregation)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.groupKeyGenerator = groupKeyGenerator;
		this.aggregation = aggregation;

		this.isFirstRow = true;

		this.currentKey = null;
		this.currentKeySerialized = ''; // _serializeKey() never returns ''
		this.lastRow = null;
	}

	_serializeKey(key)
	{
		return Collator.generateGroupKey(DataType.STRING, key);
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
		if (!this.isFirstRow) {
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
