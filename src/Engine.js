const SqlParser = require('./sql/Parser');
const SqlToJs = require('./SqlToJs');
const JlTransformsChain = require('./stream/JlTransformsChain');
const PreparingContext = require('./PreparingContext');
const RuntimeContext = require('./RuntimeContext');
const FunctionsMap = require('./FunctionsMap');
const Select = require('./Select');
const fs = require('fs');
const path = require('path');

class Engine
{
	createSelect(sql)
	{
		const functionsMap = this.createFunctionsMap();
		const runtimeContext = new RuntimeContext(functionsMap);

		const sqlToJs = new SqlToJs(
			functionsMap,
			runtimeContext
		);

		const preparingContext = new PreparingContext(
			sqlToJs,
			functionsMap
		);

		const select = new Select(preparingContext, runtimeContext, SqlParser.parse(sql));
		return select;
	}

	createFunctionsMap()
	{
		const map = new FunctionsMap;

		const dirs = [
			path.join(__dirname, 'sqlFunctions', 'aggregation'),
			path.join(__dirname, 'sqlFunctions', 'basic')
		];

		for (const dir of dirs) {
			const files = fs.readdirSync(dir);

			for (const file of files) {
				const parsed = path.parse(file);
				if (parsed.ext !== '.js') {
					continue;
				}

				map.add([parsed.name], require(path.join(dir, file)));
			}
		}

		return map;
	}
}

module.exports = Engine;
