const BasicFunction = require('./BasicFunction');

class RuntimeContext
{
	constructor(functionsMap)
	{
		this.basicFunctions = {};
		this.basicFunctionsPropertyName = 'basicFunctions';

		this.aggregations = {};
		this.aggregationsPropertyName = 'aggregations';

		for (const [path, func] of functionsMap) {
			if (path.length > 1) {
				throw new Error('Multilevel names for functions is not supported');
			}

			if (!(func.prototype instanceof BasicFunction)) {
				continue;
			}

			const f = new func;

			this.basicFunctions[path[0]] = f.call.bind(f);
		}
	}
}

module.exports = RuntimeContext;
