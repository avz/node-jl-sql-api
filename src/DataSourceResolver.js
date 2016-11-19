'use strict';

const DataSource = require('./DataSource');
const ImplementationRequired = require('./error/ImplementationRequired');

class DataSourceResolver
{
	_resolve(location)
	{
		const stream = this.resolve(location);

		if (!stream) {
			return null;
		}

		if (stream instanceof DataSource) {
			return stream;
		}

		return new DataSource(stream);
	}

	resolve(location)
	{
		throw new ImplementationRequired;
	}

	extractAlias(location)
	{
		return null;
	}
}

module.exports = DataSourceResolver;
