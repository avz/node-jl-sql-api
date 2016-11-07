const ColumnsAnalyser = require('./ColumnsAnalyser');
const SorterInMemory = require('./stream/SorterInMemory');
const SorterExternal = require('./stream/SorterExternal');
const Filter = require('./stream/Filter');
const PropertiesPickerTransformer = require('./stream/PropertiesPickerTransformer');
const Groupper = require('./stream/Groupper');
const Order = require('./Order');
const Aggregation = require('./Aggregation');
const AggregationColumn = require('./AggregationColumn');
const JlTransformsChain = require('./stream/JlTransformsChain');
const JlTransform = require('./stream/JlTransform');
const JlPassThrough = require('./stream/JlPassThrough');

class Select
{
	/**
	 *
	 * @param {PreparingContext} preparingContext
	 * @param {RuntimeContext} runtimeContext
	 * @param {Node} ast
	 */
	constructor(preparingContext, runtimeContext, ast)
	{
		if (ast.joins.length) {
			throw new Error('Joins is not supported yet');
		}

		if (ast.table) {
			throw new Error('FROM is not supported yet');
		}

		if (ast.limit) {
			throw new Error('LIMIT is not supported yet');
		}

		/**
		 * @type {PreparingContext}
		 */
		this.preparingContext = preparingContext;

		/**
		 * @type {PreparingContext}
		 */
		this.runtimeContext = runtimeContext;
		this.sqlToJs = preparingContext.sqlToJs;
		this.ast = ast;

		const columnsAnalyser = new ColumnsAnalyser(preparingContext);
		this.columns = columnsAnalyser.analyse(ast);
	}

	sorter()
	{
		const orders = this.orders(this.ast.orders);
		if (!orders.length) {
			return null;
		}

		return this.createSorterInstance(orders);
	}

	filter()
	{
		if (!this.ast.where) {
			return null;
		}

		return new Filter(this.sqlToJs.nodeToFunction(this.ast.where));
	}

	having()
	{
		if (!this.ast.having) {
			return null;
		}

		return new Filter(this.sqlToJs.nodeToFunction(this.ast.having));
	}

	orders(ordersOrGroups)
	{
		if (!ordersOrGroups.length) {
			return [];
		}

		const orders = ordersOrGroups.map(item => {
			const valueFunc = this.sqlToJs.nodeToFunction(item.expression);
			const direction = item.direction === 'DESC' ? Order.DIRECTION_DESC : Order.DIRECTION_ASC;

			return new Order(valueFunc, direction);
		});

		return orders;
	}

	hasAggregationColumns()
	{
		for (const [path, column] of this.columns) {
			if (column instanceof AggregationColumn) {
				return true;
			}
		}

		return false;
	}

	createSorterInstance(orders)
	{
		if (this.preparingContext.options.externalSort) {
			return new SorterExternal(orders);
		} else {
			return new SorterInMemory(orders);
		}
	}

	groupper()
	{
		const groupper = this.createGroupper();

		if (!groupper) {
			return null;
		}

		if (groupper && !this.ast.groups.length) {
			// implicit GROUP BY
			return groupper;
		}

		// make pre-sorting
		const sorter = this.createSorterInstance(this.orders(this.ast.groups));

		const chain = new JlTransformsChain([sorter, groupper]);

		return chain;
	}

	stream()
	{
		const pipeline = [];

		const filter = this.filter();
		if (filter) {
			pipeline.push(filter);
		}

		const groupper = this.groupper();
		if (groupper) {
			pipeline.push(groupper);
		} else if (this.columns.size) {
			/*
			 * группировщик сам создаёт строки с нужными полями, поэтому вычленение
			 * полей нужно только для безгруппировочных запросов
			 */
			const m = new Map;

			for (const [path, column] of this.columns) {
				m.set(path, column.valueSource());
			}

			pipeline.push(new PropertiesPickerTransformer(m));
		}

		const having = this.having();
		if (having) {
			pipeline.push(having);
		}

		const sorter = this.sorter();
		if (sorter) {
			pipeline.push(sorter);
		}

		if (!pipeline.length) {
			return new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS)
		}

		return new JlTransformsChain(pipeline);
	}

	/**
	 * @private
	 */
	createGroupper()
	{
		if (!this.ast.groups.length) {
			if (!this.hasAggregationColumns()) {
				return null;
			}

			/*
			 * For aggregation queries without GROUP BY, e.g. `SELECT SUM(c) AS sum`
			 */
			return new Groupper(() => [null], new Aggregation(this.runtimeContext, this.columns));
		}

		if (!this.columns.size) {
			throw new Error('`SELECT * ... GROUP BY ...` does not make sense');
		}

		const keyGenerators = this.ast.groups.map(g => this.sqlToJs.nodeToFunction(g.expression));

		const keyGeneratorCb = row => {
			return keyGenerators.map(g => g(row));
		};

		return new Groupper(keyGeneratorCb, new Aggregation(this.runtimeContext, this.columns));
	}
}

module.exports = Select;
