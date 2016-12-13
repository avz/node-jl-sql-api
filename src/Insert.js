'use strict';

const Append = require('./stream/Append');

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
		return new Append(this.ast.rows);
	}
}

module.exports = Insert;
