'use strict';

const SqlParser = require('./sql/Parser');
const SqlNodes = require('./sql/Nodes');
const SqlToJs = require('./SqlToJs');
const PreparingContext = require('./PreparingContext');
const RuntimeContext = require('./RuntimeContext');
const FunctionsMap = require('./FunctionsMap');
const Select = require('./Select');
const Insert = require('./Insert');
const Update = require('./Update');
const path = require('path');

class Engine
{
	/**
	 *
	 * @param {string} sql
	 * @param {PublicApiOptions} options
	 * @returns {Select|Insert}
	 */
	createQuery(sql, options = {})
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

		preparingContext.options = options;

		const ast = SqlParser.parse(sql);

		if (ast instanceof SqlNodes.Select) {

			return new Select(preparingContext, runtimeContext, ast);
		} else if (ast instanceof SqlNodes.Delete) {
			const selectAst = new SqlNodes.Select;

			if (ast.where) {
				selectAst.where = new SqlNodes.UnaryLogicalOperation('!', ast.where);
			} else {
				selectAst.where = new SqlNodes.Boolean(false);
			}

			return new Select(preparingContext, runtimeContext, selectAst);
		} else if (ast instanceof SqlNodes.Insert) {

			return new Insert(preparingContext, runtimeContext, ast);
		} else if (ast instanceof SqlNodes.Update) {

			return new Update(preparingContext, runtimeContext, ast);
		} else {
			throw new Error('Unknown query: ' + ast.constructor.name);
		}
	}

	/**
	 * @@returns {FunctionsMap}
	 */
	createFunctionsMap()
	{
		const map = new FunctionsMap;

		// Generated by
		// ls */*.js | awk '{print "\t\tmap.add([path.parse('\''"$1"'\'').name], require('\''./sqlFunctions/"$1"'\''));"}'

		map.add([path.parse('aggregation/AVG.js').name], require('./sqlFunctions/aggregation/AVG.js'));
		map.add([path.parse('aggregation/COUNT.js').name], require('./sqlFunctions/aggregation/COUNT.js'));
		map.add([path.parse('aggregation/COUNT_DISTINCT.js').name], require('./sqlFunctions/aggregation/COUNT_DISTINCT.js'));
		map.add([path.parse('aggregation/MAX.js').name], require('./sqlFunctions/aggregation/MAX.js'));
		map.add([path.parse('aggregation/MIN.js').name], require('./sqlFunctions/aggregation/MIN.js'));
		map.add([path.parse('aggregation/SUM.js').name], require('./sqlFunctions/aggregation/SUM.js'));
		map.add([path.parse('basic/CEIL.js').name], require('./sqlFunctions/basic/CEIL.js'));
		map.add([path.parse('basic/COALESCE.js').name], require('./sqlFunctions/basic/COALESCE.js'));
		map.add([path.parse('basic/CONCAT.js').name], require('./sqlFunctions/basic/CONCAT.js'));
		map.add([path.parse('basic/DATE.js').name], require('./sqlFunctions/basic/DATE.js'));
		map.add([path.parse('basic/FLOOR.js').name], require('./sqlFunctions/basic/FLOOR.js'));
		map.add([path.parse('basic/FROM_UNIXTIME.js').name], require('./sqlFunctions/basic/FROM_UNIXTIME.js'));
		map.add([path.parse('basic/IF.js').name], require('./sqlFunctions/basic/IF.js'));
		map.add([path.parse('basic/NOW.js').name], require('./sqlFunctions/basic/NOW.js'));
		map.add([path.parse('basic/NUMBER.js').name], require('./sqlFunctions/basic/NUMBER.js'));
		map.add([path.parse('basic/RAND.js').name], require('./sqlFunctions/basic/RAND.js'));
		map.add([path.parse('basic/ROUND.js').name], require('./sqlFunctions/basic/ROUND.js'));
		map.add([path.parse('basic/STRING.js').name], require('./sqlFunctions/basic/STRING.js'));
		map.add([path.parse('basic/UNIX_TIMESTAMP.js').name], require('./sqlFunctions/basic/UNIX_TIMESTAMP.js'));

		return map;
	}
}

module.exports = Engine;
