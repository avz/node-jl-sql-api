const SqlParser = require('./sql/Parser');
const SqlToJs = require('./SqlToJs');
const PropertiesPicker = require('./stream/PropertiesPicker');
const JlTransformsChain = require('./stream/JlTransformsChain');
const JlTransform = require('./stream/JlTransform');
const JlPassThrough = require('./stream/JlPassThrough');

const PreparingContext = require('./PreparingContext');
const RuntimeContext = require('./RuntimeContext');
const FunctionsMap = require('./FunctionsMap');
const Select = require('./Select');

class Engine
{
	createTransform(sql)
	{
		const functionsMap = new FunctionsMap;

		functionsMap.add(['SUM'], require('./sqlFunctions/SUM'));

		const runtimeContext = new RuntimeContext;

		const sqlToJs = new SqlToJs(
			functionsMap,
			runtimeContext
		);

		const preparingContext = new PreparingContext(
			sqlToJs,
			functionsMap
		);

		const select = new Select(preparingContext, runtimeContext, SqlParser.parse(sql));
		return select.stream();
	}
}

module.exports = Engine;
