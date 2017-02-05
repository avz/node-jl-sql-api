'use strict';

class DataSourceRead
{
	/**
	 *
	 * @param {DataFunctionDescription} desc
	 * @param {string[]} location
	 * @param {object} options
	 */
	constructor(desc, location, options)
	{
		this.desc = desc;
		this.location = location;
		this.options = options;
	}
}

module.exports = DataSourceRead;
