const DataStreamResolver = require('./DataStreamResolver');
const ComplexIdentsMap = require('./ComplexIdentsMap');

class DataStreamApiResolver extends DataStreamResolver
{
	constructor()
	{
		super();

		this.streams = new ComplexIdentsMap;
	}

	addDataStream(pathFragments, stream)
	{
		this.streams.add(pathFragments, stream);
	}

	resolve(pathFragments)
	{
		return this.streams.get(pathFragments);
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

module.exports = DataStreamApiResolver;
