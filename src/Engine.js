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
const fs = require('fs');
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
