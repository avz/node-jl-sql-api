class RuntimeContext
{
	constructor()
	{
		this.sqlFunctions = {};
		this.sqlFunctionsPropertyName = 'sqlFunctions';

		this.aggregations = {};
		this.aggregationsPropertyName = 'aggregations';
	}
}

module.exports = RuntimeContext;
