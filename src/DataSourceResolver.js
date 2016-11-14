const ImplementationRequired = require('./error/ImplementationRequired');

class DataSourceResolver
{
	resolve(location, cb)
	{
		throw new ImplementationRequired;
	}

	extractAlias(location)
	{
		return null;
	}
}

module.exports = DataSourceResolver;
