'use strict';

const Nodes = require('./sql/Nodes');
const SqlNotSupported = require('./error/SqlNotSupported');
const ExpressionAnalyser = require('./ExpressionAnalyser');

class Join
{
	/**
	 *
	 * @param {string} type
	 * @param {PreparingContext} preparingContext
	 * @param {DataSource} joiningSourceStream
	 * @param {Node} ast
	 * @returns {Join}
	 */
	constructor(type, preparingContext, joiningSourceStream, ast)
	{
		this.type = type;
		this.preparingContext = preparingContext;
		this.joiningDataSource = joiningSourceStream;
		this.joiningDataSourceName = joiningSourceStream.alias;
		this.ast = ast;

		this.joiningDataSourceSortingsColumns = [];
		this.mainDataSourceSortingsColumns = [];

		this.parseAst(ast);
	}

	/**
	 *
	 * @param {Node} ast
	 * @returns {undefined}
	 */
	parseAst(ast)
	{
		if (ast instanceof Nodes.Brackets) {
			this.parseAst(ast.expression);

			return;
		}

		if (!(ast instanceof Nodes.ComparisonOperation)) {
			throw new SqlNotSupported('Only basic JOIN ON expression is supported: @source1.field1 = @source2.field2');
		}

		if (ast.operator !== '=') {
			throw new SqlNotSupported('Only operator = is supported yet in JOIN ON');
		}

		const expressionAnalyser = new ExpressionAnalyser(this.preparingContext);
		const usedLeft = expressionAnalyser.extractUsedSources(ast.left);
		const usedRight = expressionAnalyser.extractUsedSources(ast.right);

		const sortingJoining = [];
		const sortingMain = [];

		if (usedLeft.includes(this.joiningDataSourceName)) {
			if (usedRight.includes(this.joiningDataSourceName) || usedLeft.length > 1) {
				throw new SqlNotSupported('Only basic JOIN ON expression is supported: @source1.field1 = @source2.field2');
			}

			sortingJoining.push(ast.left);
			sortingMain.push(ast.right);

		} else if (usedRight.includes(this.joiningDataSourceName)) {
			if (usedLeft.includes(this.joiningDataSourceName) || usedRight.length > 1) {
				throw new SqlNotSupported('Only basic JOIN ON expression is supported: @source1.field1 = @source2.field2');
			}

			sortingJoining.push(ast.right);
			sortingMain.push(ast.left);
		}

		this.joiningDataSourceSortingsColumns = sortingJoining;
		this.mainDataSourceSortingsColumns = sortingMain;
	}
}

Join.LEFT = 'LEFT';
Join.INNER = 'INNER';

module.exports = Join;
