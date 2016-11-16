const SqlNodes = require('./sql/Nodes');
const AggregationFunction = require('./AggregationFunction');
const PublicApiOptions = require('./PublicApiOptions');
const DataType = require('./DataType');

/**
 * Контекст, который используется на этапе подготовки запроса.
 * В него входит, например, список обычных и агрегирующийх функций,
 * доступных в системе
 */
class PreparingContext
{
	constructor(sqlToJs, functionsMap)
	{
		this.sqlToJs = sqlToJs;
		this.functionsMap = functionsMap;

		/**
		 * @type {PublicApiOptions}
		 */
		this.options = new PublicApiOptions;
	}

	isAggregationExpression(expression)
	{
		const callIsAggregation = call => {
			const func = this.functionsMap.need(call.function.fragments);

			if (func.prototype instanceof AggregationFunction) {
				return true;
			}

			return false;
		}

		if (expression instanceof SqlNodes.Call) {
			if (callIsAggregation(expression)) {
				return true;
			}
		}

		for (const node of expression.eachChildNodeRecursive()) {
			if (this.isAggregationExpression(node)) {
				return true;
			}
		}

		return false;
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
			[SqlNodes.ComparsionOperation, DataType.BOOL],
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
			const func = this.functionsMap.need(expression.function.fragments);
			return func.dataType();
		}

		return DataType.MIXED;
	}
}

module.exports = PreparingContext;
