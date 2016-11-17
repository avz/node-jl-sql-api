'use strict';

const NotFound = require('./NotFound');

class DataSourceNotFound extends NotFound
{
	constructor(pathFragments)
	{
		super(pathFragments.join('.'));
	}
}

module.exports = DataSourceNotFound;
