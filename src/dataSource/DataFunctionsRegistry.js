'use strict';

const ComplexIdentsMap = require('../ComplexIdentsMap');

class DataFunctionsRegistry
{
	constructor()
	{
		this.map = new ComplexIdentsMap;
	}

	/**
	 * @param {DataFunctionDescription} desc
	 */
	add(desc)
	{
		this.map.add([desc.name], desc);
	}

	/**
	 * @param {string|string[]} name
	 * @returns {DataFunctionDescription}
	 */
	need(name)
	{
		return this.map.need(name instanceof Array ? name : [name]);
	}
}

module.exports = DataFunctionsRegistry;
