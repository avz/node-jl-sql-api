class DataStreamResolversPool
{
	constructor()
	{
		this.resolvers = [];
	}

	add(resolver)
	{
		this.resolvers.push(resolver);
	}

	resolve(pathFragments)
	{
		for (const resolver of this.resolvers) {
			const stream = resolver.resolve(pathFragments);
			if (stream) {
				return stream;
			}
		}

		throw new Error('Data stream not found: ' + pathFragments.join('.'));
	}

	extractAlias(pathFragments) {
		for (const resolver of this.resolvers) {
			const alias = resolver.extractAlias(pathFragments);
			if (alias !== null) {
				return alias;
			}
		}

		return null;
	}
}

module.exports = DataStreamResolversPool;