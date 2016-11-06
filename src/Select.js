const ColumnsAnalyser = require('./ColumnsAnalyser');
const SorterInMemory = require('./stream/SorterInMemory');
const Filter = require('./stream/Filter');
const PropertiesPicker = require('./stream/PropertiesPicker');
const Groupper = require('./stream/Groupper');
const Aggregation = require('./Aggregation');
const AggregationColumn = require('./AggregationColumn');
const JlTransformsChain = require('./stream/JlTransformsChain');
const JlTransform = require('./stream/JlTransform');
const JlPassThrough = require('./stream/JlPassThrough');

class Select
{
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

		this.preparingContext = preparingContext;
		this.runtimeContext = runtimeContext;
		this.sqlToJs = preparingContext.sqlToJs;
		this.ast = ast;

		const columnsAnalyser = new ColumnsAnalyser(preparingContext);
		this.columns = columnsAnalyser.analyse(ast);
	}

	sorter()
	{
		const sf = this.sortingFunction(this.ast.orders);
		if (!sf) {
			return null;
		}

		return new SorterInMemory(sf);
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

	sortingFunction(ordersOrGroups)
	{
		if (!ordersOrGroups.length) {
			return null;
		}

		const valueFuncs = ordersOrGroups.map(order => this.sqlToJs.nodeToFunction(order.expression));

		const compare = function(row1, row2) {
			for (let i = 0; i < valueFuncs.length; i++) {
				const valueFunc = valueFuncs[i];

				const v1 = valueFunc(row1);
				const v2 = valueFunc(row2);

				const direction = ordersOrGroups[i].direction === 'DESC' ? -1 : 1;

				if (v1 > v2) {
					return direction;
				} else if (v1 < v2) {
					return -direction;
				}
			}

			return 0;
		};

		return compare;
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
		const sorter = new SorterInMemory(this.sortingFunction(this.ast.groups));

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

			pipeline.push(new PropertiesPicker(m));
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
