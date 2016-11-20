'use strict';

const Engine = require('./Engine');
const PublicSelect = require('./public/Select');
const PublicApiOptions = require('./PublicApiOptions');
const Explainer = require('./Explainer');

class PublicApi
{
	/**
	 *
	 * @param {PublicApiOptions} options
	 */
	constructor(options = new PublicApiOptions)
	{
		if (options instanceof PublicApiOptions) {
			this.options = options;
		} else {
			this.options = new PublicApiOptions(options);
		}

		this.engine = new Engine();
	}

	/**
	 *
	 * @param {string} sql
	 * @returns {PublicSelect}
	 */
	query(sql)
	{
		return new PublicSelect(this.engine.createSelect(sql, this.options), this.options.dataSourceResolvers);
	}

	explain(select)
	{
		const e = new Explainer();

		return e.createExplain(select);
	}
}

PublicApi.DataSourceResolver = require('./DataSourceResolver');

PublicApi.exceptions = {
	JlException: require('./error/JlException'),
	SqlFunctionArgumentError: require('./error/SqlFunctionArgumentError'),
	SqlLogicError: require('./error/SqlLogicError'),
	SqlNotSupported: require('./error/SqlNotSupported'),
	JsonParsingError: require('./error/JsonParsingError'),
	DataSourceNotFound: require('./error/DataSourceNotFound')
};

module.exports = PublicApi;
