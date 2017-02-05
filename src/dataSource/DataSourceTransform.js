'use strict';

class DataSourceTransform
{
	/**
	 *
	 * @param {DataFunctionDescription} desc
	 * @param {DataSourceRead} input
	 * @param {object} options
	 */
	constructor(desc, input, options)
	{
		this.desc = desc;
		this.input = input;
		this.options = options;
	}
}

module.exports = DataSourceTransform;
