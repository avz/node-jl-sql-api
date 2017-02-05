'use strict';

const Append = require('./stream/Append');
const DataRow = require('./DataRow');

class Insert
{
	/**
	 * @param {DataProvider} dataProvider
	 * @param {PreparingContext} preparingContext
	 * @param {RuntimeContext} runtimeContext
	 * @param {Node} ast
	 */
	constructor(dataProvider, preparingContext, runtimeContext, ast)
	{
		this.dataProvider = dataProvider;
		this.preparingContext = preparingContext;
		this.runtimeContext = runtimeContext;
		this.ast = ast;
	}

	/**
	 * @returns {Append}
	 */
	stream()
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
