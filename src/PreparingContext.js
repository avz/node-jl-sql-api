const SqlNodes = require('./sql/Nodes');
const AggregationFunction = require('./AggregationFunction');
const PublicApiOptions = require('./PublicApiOptions');

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
}

module.exports = PreparingContext;
