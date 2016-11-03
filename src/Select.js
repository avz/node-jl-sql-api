const ColumnsAnalyser = require('./ColumnsAnalyser');
const Sorter = require('./stream/Sorter');
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

		return new Sorter(sf);
	}

	filter()
	{
		if (!this.ast.where) {
			return null;
		}

		return new Filter(this.sqlToJs.nodeToFunction(this.ast.where));
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
		for (const [path, column] of columns) {
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
		const sorter = new Sorter(this.sortingFunction(this.ast.groups));

		const chain = new JlTransformsChain;
		chain.append(sorter);
		chain.append(groupper);

		return chain;
	}

	stream()
	{
		const chain = new JlTransformsChain;

		const filter = this.filter();
		if (filter) {
			chain.append(filter);
		}

		const groupper = this.groupper();
		if (groupper) {
			chain.append(groupper);
		} else {
			/*
			 * группировщик сам создаёт строки с нужными полями, поэтому вычленение
			 * полей нужно только для безгруппировочных запросов
			 */
			const m = new Map;

			for (const [path, column] of this.columns) {
				m.set(path, column.valueSource());
			}

			chain.append(new PropertiesPicker(m));
		}

		const sorter = this.sorter();
		if (sorter) {
			chain.append(sorter);
		}

		if (chain.isEmpty()) {
			return new JlPassThrough(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS)
		}

		return chain;
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

		const keyGenerators = this.ast.groups.map(g => this.sqlToJs.nodeToFunction(g.expression));

		const keyGeneratorCb = row => {
			return keyGenerators.map(g => g(row));
		};

		return new Groupper(keyGeneratorCb, new Aggregation(this.runtimeContext, this.columns));
	}

	/**
	 * @private
	 */
	appendGroupBy(chain, preparingContext, runtimeContext, select, columns)
	{
		const sqlToJs = preparingContext.sqlToJs;
		let implicitGroupper = null;

		if (!select.groups.length) {
			/*
			 * For aggregation queries without GROUP BY, e.g. `SELECT SUM(c) AS sum`
			 */
			let hasAggregation = false;

			for (const [path, column] of columns) {
				if (column instanceof AggregationColumn) {
					hasAggregation = true;
					break;
				}
			}

			if (hasAggregation) {
				implicitGroupper = new Groupper(() => [null], new Aggregation(runtimeContext, columns));
			}
		}

		if (select.groups.length) {
			chain.append(new Sorter(this.createSortingFunction(sqlToJs, select.groups)));
			chain.append(this.createGroupper(sqlToJs, runtimeContext, columns, select.groups));
		} else if (implicitGroupper) {
			chain.append(implicitGroupper);
		} else {
			return false;
		}

		return true;
	}
}

module.exports = Select;
