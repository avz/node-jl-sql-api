'use strict';

const Append = require('./stream/Append');
const DataRow = require('./DataRow');

class Insert
{
	/**
	 *
	 * @param {PreparingContext} preparingContext
	 * @param {RuntimeContext} runtimeContext
	 * @param {Node} ast
	 */
	constructor(preparingContext, runtimeContext, ast)
	{
		this.preparingContext = preparingContext;
		this.runtimeContext = runtimeContext;
		this.ast = ast;
	}

	stream(dataSourceResolversPool)
	{
		const dummyRow = new DataRow({});
		const rows = [];

		for (const exp of this.ast.rows) {
			rows.push(this.preparingContext.sqlToJs.nodeToFunction(exp)(dummyRow));
		}

		return new Append(rows);
	}
}

module.exports = Insert;
