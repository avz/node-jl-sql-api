const JlTransform = require('./JlTransform');

class Groupper extends JlTransform
{
	constructor(groupKeyGenerator, aggregation)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.groupKeyGenerator = groupKeyGenerator;
		this.aggregation = aggregation;

		this.currentKey = null;
		this.lastRow = null;
	}

	_transform(chunk, encoding, cb)
	{
		for (let i = 0; i < chunk.length; i++) {
			const row = chunk[i];

			const key = this.groupKeyGenerator(row);

			/* TODO cache JSON or compile comparation function */
			if (JSON.stringify(key) === JSON.stringify(this.currentKey)) {
				this.aggregation.update(row);
				this.currentKey = key;

				continue;
			}

			/* группа поменялась или же это первая группа */

			if (this.currentKey) {
				this.push([this.aggregation.result()]);
				this.aggregation.deinit();
			}

			this.currentKey = key;

			this.aggregation.init();
			this.aggregation.update(row);
		}

		cb();
	}

	_flush(cb)
	{
		if (this.currentKey) {
			this.push([this.aggregation.result()]);
			this.aggregation.deinit();
		}

		cb();
	}
}

module.exports = Groupper;
