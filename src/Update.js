'use strict';

const ExpressionAnalyser = require('./ExpressionAnalyser');
const BasicColumn = require('./BasicColumn');
const PropertiesPickerTransformer = require('./stream/PropertiesPickerTransformer');
const Mutator = require('./stream/Mutator');
const DataRow = require('./DataRow');
const DataSource = require('./DataSource');
const JlTransformsChain = require('./stream/JlTransformsChain');
const SqlLogicError = require('./error/SqlLogicError');

class Update
{
	/**
	 * @param {DataProvider} dataProvider
	 * @param {PreparingContext} preparingContext
	 * @param {RuntimeContext} runtimeContext
	 * @param {SqlNodes.Update} ast
	 */
	constructor(dataProvider, preparingContext, runtimeContext, ast)
	{
		this.dataProvider = dataProvider;
		this.preparingContext = preparingContext;
		this.runtimeContext = runtimeContext;
		this.ast = ast;

		const expressionAnalyser = new ExpressionAnalyser(preparingContext);

		for (const s of this.ast.sets) {
			if (expressionAnalyser.isAggregationExpression(s.expression)) {
				throw new SqlLogicError('aggregation function in SET');
			}
		}

		if (ast.where) {
			if (expressionAnalyser.isAggregationExpression(ast.where)) {
				throw new SqlLogicError('aggregation function in WHERE');
			}
		}
	}

	/**
	 * @returns {JlTransformsChain}
	 */
	stream()
	{
		const filter = this.ast.where ? this.preparingContext.sqlToJs.nodeToFunction(this.ast.where) : null;
		const pipeline = [new Mutator(DataRow.wrap)];

		const m = new Map;

		for (const s of this.ast.sets) {
			m.set(
				s.columnIdent.getFragments(),
				(new BasicColumn(this.preparingContext, s.columnIdent, s.expression)).valueSource()
			);
		}

		pipeline.push(new PropertiesPickerTransformer(m, true, filter));

		pipeline.push(
			new Mutator(row => {
				return row.sources[DataSource.DEFAULT_NAME] || {};
			})
		);

		return new JlTransformsChain(pipeline);
	}
}

module.exports = Update;
