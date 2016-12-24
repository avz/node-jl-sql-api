'use strict';

const SqlNodes = require('./sql/Nodes');

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
				return source;
			}
		}

		return null;
	}

	/**
	 *
	 * @param {ComplexIdent} complexIdent
	 * @returns {string}
	 */
	extractBindingAlias(complexIdent)
	{
		const lastFragment = complexIdent.fragments[complexIdent.fragments.length - 1];

		if (lastFragment instanceof SqlNodes.BindingIdent || lastFragment instanceof SqlNodes.BindingIdentList) {
			return lastFragment.basename();
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
