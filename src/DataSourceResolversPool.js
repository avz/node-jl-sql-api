'use strict';

const DataSource = require('./DataSource');

class DataSourceResolversPool
{
	constructor()
	{
		this.resolvers = [];
	}

	/**
	 *
	 * @param {DataSourceResolver} resolver
	 * @returns {undefined}
	 */
	add(resolver)
	{
		this.resolvers.push(resolver);
	}

	/**
	 *
	 * @param {string[]} pathFragments
	 * @returns {DataSource|null}
	 */
	resolve(pathFragments)
	{
		for (const resolver of this.resolvers) {
			const source = resolver._resolve(pathFragments);

			if (source) {
				if (source instanceof DataSource) {
					return source;
				} else {
					return new DataSource(source, resolver.extractAlias(pathFragments));
				}
			}
		}

		return null;
	}

	/**
	 *
	 * @param {string[]} pathFragments
	 * @returns {string}
	 */
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
