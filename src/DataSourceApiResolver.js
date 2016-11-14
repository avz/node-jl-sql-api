const DataSourceResolver = require('./DataSourceResolver');
const ComplexIdentsMap = require('./ComplexIdentsMap');

class DataSourceApiResolver extends DataSourceResolver
{
	constructor()
	{
		super();

		this.sources = new ComplexIdentsMap;
	}

	addDataSource(pathFragments, source)
	{
		this.sources.add(pathFragments, source);
	}

	resolve(pathFragments)
	{
		return this.sources.get(pathFragments);
	}

	extractAlias(pathFragments)
	{
		if (pathFragments.length !== 1) {
			return null;
		}

		if (/^[a-z_][a-z0-9_]*$/i.test(pathFragments[0])) {
			return pathFragments[0];
		}

		return null;
	}
}

module.exports = DataSourceApiResolver;
