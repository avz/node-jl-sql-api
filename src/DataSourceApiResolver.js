'use strict';

const DataSourceResolver = require('./DataSourceResolver');
const ComplexIdentsMap = require('./ComplexIdentsMap');

class DataSourceApiResolver extends DataSourceResolver
{
	constructor()
	{
		super();

		this.sources = new ComplexIdentsMap;
	}

	/**
	 *
	 * @param {string[]} pathFragments
	 * @param {DataSource} source
	 * @returns {undefined}
	 */
	addDataSource(pathFragments, source)
	{
		this.sources.add(pathFragments, source);
	}

	/**
	 *
	 * @param {string[]} pathFragments
	 * @returns {DataSource}
	 */
	resolve(pathFragments)
	{
		return this.sources.get(pathFragments);
	}

	/**
	 *
	 * @param {string[]} pathFragments
	 * @returns {string|null}
	 */
	extractAlias(pathFragments)
	{
		if (!pathFragments.length) {
			return null;
		}

		const last = pathFragments[pathFragments.length - 1];

		if (/^[a-z_][a-z0-9_]*$/i.test(last)) {
			return last;
		}

		return null;
	}
}

module.exports = DataSourceApiResolver;
