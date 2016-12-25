'use strict';

const JlTransformsChain = require('./JlTransformsChain');
const Order = require('../Order');
const SortWrapper = require('../external/sort/SortWrapper');
const CutWrapper = require('../external/CutWrapper');
const SortInputTransform = require('../external/sort/SortInputTransform');
const LinesSplitter = require('./LinesSplitter');
const JsonParser = require('./JsonParser');
const Terminator = require('./Terminator');
const DataType = require('../DataType');

const ProgramError = require('../error/ProgramError');

class SorterExternal extends JlTransformsChain
{
	/**
	 * @param {Order[]} orders
	 * @param {SortOptions} options
	 */
	constructor(orders, options)
	{
		if (!orders.length) {
			throw new ProgramError('Empty orders');
		}

		super();

		this.orders = orders;

		const preparedSortInput = new SortInputTransform(orders);

		const combinedOptions = options.clone();

		combinedOptions.separator = preparedSortInput.columnSeparator;
		combinedOptions.keys = this.keysDefinition(orders);

		const sort = new SortWrapper(combinedOptions);
		const cut = new CutWrapper(
			preparedSortInput.columnSeparator,
			(orders.length + 1) + '-'
		);

		sort.stdout.pipe(cut.stdin);

		this.init([
			preparedSortInput,
			sort.stdin,
			new Terminator,
			cut.stdout,
			new LinesSplitter,
			new JsonParser
		]);
	}

	keysDefinition(orders)
	{
		const keys = [];

		for (const i in orders) {
			const order = orders[i];
			const dataType = order.dataType;

			const sn = parseInt(i, 10) + 1;
			let def = sn + ',' + sn;

			if (order.direction === Order.DIRECTION_DESC) {
				def += 'r';
			}

			if (dataType === DataType.NUMBER) {
				def += 'n';
			}

			keys.push(def);
		}

		return keys;
	}
}

module.exports = SorterExternal;
