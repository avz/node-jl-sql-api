'use strict';

const Transform = require('stream').Transform;
const DataType = require('../../DataType');

class SortInputTransform extends Transform
{
	constructor(orders)
	{
		super({objectMode: true});

		this.columnSeparator = '\t';
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
				let v = order.valueFunction(row);

				if (order.valueFunction.dataType === DataType.MIXED) {
					v = v === undefined ? '' : JSON.stringify(v + '');
				}

				columnValues.push(v);
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
