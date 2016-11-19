'use strict';

class DataSourceResolversPool
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
			const source = resolver._resolve(pathFragments);

			if (source) {
				return source;
			}
		}

		return null;
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

module.exports = DataSourceResolversPool;
