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
}

module.exports = DataStreamApiResolver;
