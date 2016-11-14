const ColumnsAnalyser = require('./ColumnsAnalyser');
const SorterInMemory = require('./stream/SorterInMemory');
const SorterExternal = require('./stream/SorterExternal');
const Filter = require('./stream/Filter');
const Joiner = require('./stream/Joiner');
const PropertiesPickerTransformer = require('./stream/PropertiesPickerTransformer');
const Groupper = require('./stream/Groupper');
const Order = require('./Order');
const Terminator = require('./stream/Terminator');
const Join = require('./Join');
const Mapper = require('./stream/Mapper');
const Aggregation = require('./Aggregation');
const AggregationColumn = require('./AggregationColumn');
const JlTransformsChain = require('./stream/JlTransformsChain');
const JlTransform = require('./stream/JlTransform');
const JlPassThrough = require('./stream/JlPassThrough');
const DataRow = require('./DataRow');
const DataStream = require('./DataStream');
const Nodes = require('./sql/Nodes');

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

	joins(dataStreamResolversPool)
	{
		const joins = [];

		for (const joinAst of this.ast.joins) {
			let joinType;

			if (joinAst instanceof Nodes.LeftJoin) {
				joinType = Join.LEFT;
			} else if (joinAst instanceof Nodes.InnerJoin) {
				joinType = Join.INNER;
			} else {
				throw new Error('INNER ans LEFT JOINs only supported yet');
			}

			if (!joinAst.table.alias) {
				throw new Error('Tables must have an alias');
			}

			const dataStream = dataStreamResolversPool.resolve(joinAst.table.location.fragments);

			joins.push(new Join(
				joinType,
				this.preparingContext,
				dataStream,
				joinAst.table.alias.name,
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
			return new SorterExternal(orders, this.preparingContext.options.sortOptions);
		} else {
			return new SorterInMemory(orders, this.preparingContext.options.sortOptions);
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

	joinerPipeline(join)
	{
		if (join.mainDataStreamSortingsColumns.length !== 1 || join.mainDataStreamSortingsColumns.length !== 1) {
			throw new Error('Not implemented');
		}


		const joiningWrapper = new Mapper(row => {
			const s = {};
			s[join.joiningDataStreamName] = row;
			return new DataRow(s)
		});

		const joiningSorter = this.createSorterInstance(this.orders(
			join.joiningDataStreamSortingsColumns.map(e => new Nodes.Brackets(e))
		));

		const mainSorter = this.createSorterInstance(this.orders(
			join.mainDataStreamSortingsColumns.map(e => new Nodes.Brackets(e))
		));

		const joiner = new Joiner(
			this.preparingContext,
			join,
			this.sqlToJs.nodeToFunction(join.mainDataStreamSortingsColumns[0]),
			mainSorter,
			this.sqlToJs.nodeToFunction(join.joiningDataStreamSortingsColumns[0]),
			join.joiningDataStream.stream.pipe(joiningWrapper).pipe(joiningSorter)
		);

		return [
			mainSorter,
			new Terminator,
			joiner
		];
	}

	stream(dataStreamResolversPool)
	{
		const pipeline = [
			new Mapper(row => new DataRow({'@': row})) // '@' - DataStream.DEFAULT_NAME
		];

		const joins = this.joins(dataStreamResolversPool);

		for (const join of joins) {
			pipeline.push.apply(pipeline, this.joinerPipeline(join));
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

		pipeline.push(
			new Mapper(row => {
				return row.sources[DataStream.DEFAULT_NAME] || {};
			})
		);

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
