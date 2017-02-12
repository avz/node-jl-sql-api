'use strict';

const ComplexIdentsMap = require('../ComplexIdentsMap');

class DataFunctionsRegistry
{
	constructor()
	{
		this.map = new ComplexIdentsMap(false);
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

	/**
	 *
	 * @param {string|string[]} name
	 * @returns {Boolean}
	 */
	exists(name)
	{
		return !!this.map.get(name instanceof Array ? name : [name]);
	}
}

module.exports = DataFunctionsRegistry;
