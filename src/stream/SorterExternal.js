const JlTransform = require('./JlTransform');
const JlTransformsChain = require('./JlTransformsChain');
const Order = require('../Order');
const SortWrapper = require('../external/sort/SortWrapper');
const CutWrapper = require('../external/CutWrapper');
const SortInputTransform = require('../external/sort/SortInputTransform');
const LinesSplitter = require('./LinesSplitter');
const JsonParser = require('./JsonParser');
const Terminator = require('./Terminator');

class SorterExternal extends JlTransformsChain
{
	constructor(orders)
	{
		if (!orders.length) {
			throw new Error('Empty orders');
		}

		super();

		this.orders = orders;

		const preparedSortInput = new SortInputTransform(orders);

		const options = {
			separator: preparedSortInput.columnSeparator,
			keys: this.keysDefinition(orders)
		};

		const sort = new SortWrapper(options);
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

			const sn = parseInt(i) + 1;
			keys.push(sn + ',' + sn + (order.direction === Order.DIRECTION_DESC ? 'r' : ''));
		}

		return keys;
	}
}

module.exports = SorterExternal;
