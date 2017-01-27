'use strict';

const SqlNodes = require('./sql/Nodes');
const AggregationFunction = require('./AggregationFunction');
const DataType = require('./DataType');

class ExpressionAnalyser
{
	constructor(preparingContext)
	{
		this.preparingContext = preparingContext;
	}

	/**
	 *
	 * @param {Node} expression
	 * @returns {Boolean}
	 */
	isAggregationExpression(expression)
	{
		const callIsAggregation = call => {
			const func = this.preparingContext.functionsMap.need(call.function.getFragments());

			if (func.prototype instanceof AggregationFunction) {
				return true;
			}

			return false;
		};

		if (expression instanceof SqlNodes.Call) {
			if (callIsAggregation(expression)) {
				return true;
			}
		}

		var isAggregation = false;

		expression.eachChildNodeRecursive(node => {
			if (this.isAggregationExpression(node)) {
				isAggregation = true;
			}
		});

		return isAggregation;
	}

	determineExpressionDataType(expression)
	{
		const operationTypes = new Map([
			[SqlNodes.BinaryArithmeticOperation, DataType.NUMBER],
			[SqlNodes.UnaryArithmeticOperation, DataType.NUMBER],
			[SqlNodes.Number, DataType.NUMBER],

			[SqlNodes.String, DataType.STRING],

			[SqlNodes.LogicalOperation, DataType.BOOL],
			[SqlNodes.UnaryLogicalOperation, DataType.BOOL],
			[SqlNodes.ComparisonOperation, DataType.BOOL],
		]);

		for (const [ctor, type] of operationTypes) {
			if (expression instanceof ctor) {
				return type;
			}
		}

		if (expression instanceof SqlNodes.Brackets) {
			return this.determineExpressionDataType(expression.expression);
		}

		if (expression instanceof SqlNodes.Call) {
			const func = this.preparingContext.functionsMap.need(expression.function.getFragments());

			return func.dataType();
		}

		return DataType.MIXED;
	}

	/**
	 * Ищет имена использованных в выражении источников данных
	 * @param {Node} expression
	 * @returns {string[]}
	 */
	extractUsedSources(expression)
	{
		if (expression instanceof SqlNodes.ColumnIdent) {
			return [expression.getFragments()[0]];
		}

		const used = {};

		for (const child of expression.childNodes()) {
			for (const name of this.extractUsedSources(child)) {
				used[name] = true;
			}
		}

		return Object.keys(used);
	}
}

module.exports = ExpressionAnalyser;
