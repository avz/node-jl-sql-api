'use strict';

const ColumnsAnalyser = require('./ColumnsAnalyser');
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
const Nodes = require('./sql/Nodes');
const ExpressionAnalyser = require('./ExpressionAnalyser');

const SqlNotSupported = require('./error/SqlNotSupported');
const SqlLogicError = require('./error/SqlLogicError');
const NotSupported = require('./error/NotSupported');
const DataSourceNotFound = require('./error/DataSourceNotFound');

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
		if (ast.table) {
			throw new SqlNotSupported('FROM is not supported yet');
		}

		if (ast.limit) {
			throw new SqlNotSupported('LIMIT is not supported yet');
		}

		if (ast.distinct && ast.groups.length) {
			throw new SqlNotSupported('SELECT DISTINCT and GROUP BY');
		}

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

	joins(dataSourceResolversPool)
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

			let tableAlias = joinAst.table.alias && joinAst.table.alias.name;
			const dataSourcePath = joinAst.table.location.getFragments();

			if (!tableAlias) {
				tableAlias = dataSourceResolversPool.extractBindingAlias(joinAst.table.location);

				if (tableAlias !== null) {
					tableAlias = '@' + tableAlias;
				}
			}

			if (!tableAlias) {
				tableAlias = dataSourceResolversPool.extractAlias(dataSourcePath);

				if (tableAlias !== null) {
					tableAlias = '@' + tableAlias;
				}
			}

			if (!tableAlias) {
				throw new SqlLogicError('Tables must have an alias');
			}

			const dataSource = dataSourceResolversPool.resolve(dataSourcePath);

			if (!dataSource) {
				throw new DataSourceNotFound(dataSourcePath);
			}

			joins.push(new Join(
				joinType,
				this.preparingContext,
				dataSource,
				tableAlias,
				joinAst.expression
			));
		}

		return joins;
	}

	orders(ordersOrGroups)
	{
		if (!ordersOrGroups.length) {
			return [];
		}

		const orders = ordersOrGroups.map(item => {
			const valueFunc = this.sqlToJs.nodeToFunction(item.expression);
			const direction = item.direction === 'DESC' ? Order.DIRECTION_DESC : Order.DIRECTION_ASC;

			valueFunc.dataType = this.expressionAnalyser.determineExpressionDataType(item.expression);

			return new Order(valueFunc, direction);
		});

		return orders;
	}

	hasAggregationColumns()
	{
		for (const expression of this.expressions) {
			if (expression instanceof AggregationExpression) {
				return true;
			}
		}

		return false;
	}

	createSorterInstance(orders)
	{
		return new Sorter(orders, this.preparingContext.options.sortOptions);
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

	joinerPipeline(join)
	{
		if (join.mainDataSourceSortingsColumns.length < 1 || join.mainDataSourceSortingsColumns.length < 1) {
			throw new NotSupported;
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

	stream(dataSourceResolversPool)
	{
		const pipeline = [
			new Mutator(DataRow.wrap)
		];

		const joins = this.joins(dataSourceResolversPool);

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
