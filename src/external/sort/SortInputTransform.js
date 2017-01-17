'use strict';

const Transform = require('stream').Transform;
const Collator = require('../../Collator');

class SortInputTransform extends Transform
{
	/**
	 *
	 * @param {Order[]} orders
	 * @returns {SortInputTransform}
	 */
	constructor(orders)
	{
		super({objectMode: true});

		this.columnSeparator = '\t';

		/**
		 * @type {Order[]}
		 */
		this.orders = orders;
	}

	_transform(chunk, encoding, cb)
	{
		/*
		 * TODO compile key generation function
		 */
		let output = '';

		for (const row of chunk) {
			const columnValues = [];

			for (const order of this.orders) {
				const key = Collator.generateSortKey(order.dataType, order.valueFunction(row));

				columnValues.push(key);
			}

			output += columnValues.join(this.columnSeparator) + this.columnSeparator + JSON.stringify(row) + '\n';
		}

		if (output.length) {
			this.push(output);
		}

		cb();
	}
}

module.exports = SortInputTransform;
