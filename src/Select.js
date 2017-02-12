'use strict';

const ColumnsAnalyser = require('./ColumnsAnalyser');
const Aliaser = require('./Aliaser');
const Sorter = require('./stream/Sorter');
const Filter = require('./stream/Filter');
const Joiner = require('./stream/Joiner');
const PropertiesPickerTransformer = require('./stream/PropertiesPickerTransformer');
const Groupper = require('./stream/Groupper');
const Order = require('./Order');
const Terminator = require('./stream/Terminator');
const Join = require('./Join');
const Mutator = require('./stream/Mutator');
const Aggregation = require('./Aggregation');
const AggregationExpression = require('./AggregationExpression');
const JlTransformsChain = require('./stream/JlTransformsChain');
const DataRow = require('./DataRow');
const DataSource = require('./DataSource');
const DataType = require('./DataType');
const Nodes = require('./sql/Nodes');
const ExpressionAnalyser = require('./ExpressionAnalyser');

const SqlNotSupported = require('./error/SqlNotSupported');
const SqlLogicError = require('./error/SqlLogicError');
const NotSupported = require('./error/NotSupported');
const DataSourceNotFound = require('./error/DataSourceNotFound');

class Select
{
	/**
	 * @param {DataProvider} dataProvider
	 * @param {PreparingContext} preparingContext
	 * @param {RuntimeContext} runtimeContext
	 * @param {Node} queryAst
	 */
	constructor(dataProvider, preparingContext, runtimeContext, queryAst)
	{
		const ast = queryAst.clone();

		if (ast.limit) {
			throw new SqlNotSupported('LIMIT is not supported yet');
		}

		if (ast.distinct && ast.groups.length) {
			throw new SqlNotSupported('SELECT DISTINCT and GROUP BY');
		}

		/**
		 * @type {DataProvider}
		 */
		this.dataProvider = dataProvider;

		/**
		 * @type {PreparingContext}
		 */
		this.preparingContext = preparingContext;

		this.expressionAnalyser = new ExpressionAnalyser(this.preparingContext);

		/**
		 * @type {PreparingContext}
		 */
		this.runtimeContext = runtimeContext;
		this.sqlToJs = preparingContext.sqlToJs;
		this.ast = ast;

		const columnsAnalyser = new ColumnsAnalyser(preparingContext);

		this.columns = columnsAnalyser.analyseColumns(ast.columns);

		const aliaser = new Aliaser(this.columns);

		if (ast.where) {
			aliaser.expandInplace(ast.where);
		}

		if (ast.groups) {
			for (const group of ast.groups) {
				aliaser.expandInplace(group);
			}
		}

		if (this.ast.where && columnsAnalyser.expressionAnalyser.isAggregationExpression(this.ast.where)) {
			throw new SqlLogicError('aggregation function in WHERE');
		}

		this.expressions = [];

		for (const [, column] of this.columns) {
			this.expressions.push(column);
		}

		for (const order of this.ast.orders) {
			this.expressions.push(columnsAnalyser.analyseExpression(order.expression));
		}

		if (this.ast.having) {
			this.expressions.push(columnsAnalyser.analyseExpression(this.ast.having));
		}

		if (this.ast.distinct && this.hasAggregationColumns()) {
			throw new SqlNotSupported('SELECT DISTINCT and aggregation functions');
		}
	}

	/**
	 *
	 * @returns {Sorter|null}
	 */
	sorter()
	{
		const orders = this.orders(this.ast.orders);

		if (!orders.length) {
			return null;
		}

		return this.createSorterInstance(orders);
	}

	/**
	 *
	 * @returns {Filter|null}
	 */
	filter()
	{
		if (!this.ast.where) {
			return null;
		}

		return new Filter(this.sqlToJs.nodeToFunction(this.ast.where));
	}

	/**
	 *
	 * @returns {Filter|null}
	 */
	having()
	{
		if (!this.ast.having) {
			return null;
		}

		return new Filter(this.sqlToJs.nodeToFunction(this.ast.having));
	}

	/**
	 *
	 * @param {SqlNodes.Table} tableAst
	 * @returns {DataSource}
	 */
	resolveDataSource(tableAst)
	{
		const dataSource = this.dataProvider.getDataSource(tableAst);

		if (!dataSource) {
			throw new DataSourceNotFound(tableAst.source.getFragments());
		}

		if (tableAst.alias && tableAst.alias.name) {
			dataSource.alias = tableAst.alias.name;
		}

		return dataSource;
	}

	/**
	 * @returns {Join[]}
	 */
	joins()
	{
		const joins = [];

		for (const joinAst of this.ast.joins) {
			let joinType;

			if (joinAst instanceof Nodes.LeftJoin) {
				joinType = Join.LEFT;
			} else if (joinAst instanceof Nodes.InnerJoin) {
				joinType = Join.INNER;
			} else {
				throw new SqlNotSupported('INNER ans LEFT JOINs only supported yet');
			}

			const dataSource = this.resolveDataSource(joinAst.table);

			if (dataSource.alias === null || dataSource.alias === undefined) {
				throw new SqlLogicError('Tables must have an alias');
			}

			joins.push(new Join(
				joinType,
				this.preparingContext,
				dataSource,
				joinAst.expression
			));
		}

		return joins;
	}

	/**
	 *
	 * @param {Node[]} ordersOrGroups
	 * @returns {Order[]}
	 */
	orders(ordersOrGroups)
	{
		if (!ordersOrGroups.length) {
			return [];
		}

		const orders = ordersOrGroups.map(item => {
			const valueFunc = this.sqlToJs.nodeToFunction(item.expression);
			const direction = item.direction === 'DESC' ? Order.DIRECTION_DESC : Order.DIRECTION_ASC;

			const dataType = this.expressionAnalyser.determineExpressionDataType(item.expression);

			return new Order(valueFunc, direction, dataType === DataType.MIXED ? DataType.STRING : dataType);
		});

		return orders;
	}

	/**
	 *
	 * @returns {Boolean}
	 */
	hasAggregationColumns()
	{
		for (const expression of this.expressions) {
			if (expression instanceof AggregationExpression) {
				return true;
			}
		}

		return false;
	}

	/**
	 *
	 * @param {Order[]} orders
	 * @returns {Sorter}
	 */
	createSorterInstance(orders)
	{
		return new Sorter(orders, this.preparingContext.options.sortOptions);
	}

	/**
	 *
	 * @returns {null|JlTransformsChain|Groupper}
	 */
	groupper()
	{
		const groupper = this.createGroupper();

		if (!groupper) {
			return null;
		}

		if (this.ast.distinct) {
			const sorter = this.createSorterInstance(this.orders(this.ast.columns));

			const chain = new JlTransformsChain([sorter, groupper]);

			return chain;
		}

		if (!this.ast.groups.length) {
			// implicit GROUP BY
			return groupper;
		}

		// make pre-sorting
		const sorter = this.createSorterInstance(this.orders(this.ast.groups));

		const chain = new JlTransformsChain([sorter, groupper]);

		return chain;
	}

	/**
	 *
	 * @param {Join} join
	 * @returns {JlTransform[]}
	 */
	joinerPipeline(join)
	{
		if (join.mainDataSourceSortingsColumns.length < 1 || join.joiningDataSourceSortingsColumns.length < 1) {
			throw new NotSupported('Only Equi Join is supported: ON @joined.field = [@main.]field');
		}

		const joiningWrapper = new Mutator(row => {
			const s = {};

			s[join.joiningDataSourceName] = row;

			return new DataRow(s);
		});

		const joiningSorter = this.createSorterInstance(this.orders(
			join.joiningDataSourceSortingsColumns.map(e => new Nodes.Brackets(e))
		));

		const mainSorter = this.createSorterInstance(this.orders(
			join.mainDataSourceSortingsColumns.map(e => new Nodes.Brackets(e))
		));

		const joiner = new Joiner(
			this.preparingContext,
			join,
			this.sqlToJs.nodeToFunction(join.mainDataSourceSortingsColumns[0]),
			mainSorter,
			this.sqlToJs.nodeToFunction(join.joiningDataSourceSortingsColumns[0]),
			new JlTransformsChain([join.joiningDataSource.stream, joiningWrapper, joiningSorter])
		);

		return [
			mainSorter,
			new Terminator,
			joiner
		];
	}

	/**
	 * @returns {JlTransformsChain}
	 */
	stream()
	{
		const pipeline = [];

		if (this.ast.table) {
			// FROM clause
			if (this.ast.table.alias) {
				throw new SqlNotSupported('Data source in FROM should not have an alias');
			}

			const mainDataSource = this.resolveDataSource(this.ast.table);

			pipeline.push(new Terminator);
			pipeline.push(mainDataSource.stream);
		}

		pipeline.push(new Mutator(DataRow.wrap));

		const joins = this.joins();

		for (const join of joins) {
			pipeline.push(...this.joinerPipeline(join));
		}

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

			pipeline.push(new PropertiesPickerTransformer(m, this.ast.allColumns));
		}

		const having = this.having();

		if (having) {
			pipeline.push(having);
		}

		const sorter = this.sorter();

		if (sorter) {
			pipeline.push(sorter);
		}

		pipeline.push(
			new Mutator(row => {
				return row.sources[DataSource.DEFAULT_NAME] || {};
			})
		);

		return new JlTransformsChain(pipeline);
	}

	/**
	 * @private
	 * @returns {Groupper}
	 */
	createGroupper()
	{
		const aggregation = new Aggregation(this.preparingContext, this.runtimeContext, this.expressions);
		let keyGenerators;

		if (this.ast.distinct) {
			keyGenerators = this.ast.columns.map(c => this.sqlToJs.nodeToFunction(c.expression));
		} else {
			if (!this.ast.groups.length) {
				if (!this.hasAggregationColumns()) {
					return null;
				}

				/*
				 * For aggregation queries without GROUP BY, e.g. `SELECT SUM(c) AS sum`
				 */
				return new Groupper(() => null, aggregation);
			}

			if (!this.columns.size || this.ast.allColumns) {
				throw new SqlLogicError('`SELECT * ... GROUP BY ...` does not make sense');
			}

			keyGenerators = this.ast.groups.map(g => this.sqlToJs.nodeToFunction(g.expression));
		}

		let keyGeneratorCb;

		if (keyGenerators.length === 1) {
			keyGeneratorCb = keyGenerators[0];
		} else {
			keyGeneratorCb = row => {
				return keyGenerators.map(g => g(row));
			};
		}

		return new Groupper(keyGeneratorCb, aggregation);
	}
}

module.exports = Select;
