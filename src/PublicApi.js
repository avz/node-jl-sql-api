'use strict';

const Engine = require('./Engine');
const PublicSelect = require('./public/PublicSelect');
const PublicApiOptions = require('./PublicApiOptions');
const DataSourceApiResolver = require('./DataSourceApiResolver');
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

		this.engine = new Engine(this.options);
	}

	/**
	 *
	 * @param {string} sql
	 * @returns {PublicSelect}
	 */
	query(sql)
	{
		const dataSourceInternalResolver = new DataSourceApiResolver();

		return new PublicSelect(this.engine.createQuery(sql, dataSourceInternalResolver), dataSourceInternalResolver);
	}

	explain(select)
	{
		const e = new Explainer();

		return e.createExplain(select);
	}
}

PublicApi.DataSourceResolver = require('./DataSourceResolver');
PublicApi.DataSource = require('./DataSource');

PublicApi.exceptions = {
	JlException: require('./error/JlException'),
	SqlFunctionArgumentError: require('./error/SqlFunctionArgumentError'),
	SqlLogicError: require('./error/SqlLogicError'),
	SqlNotSupported: require('./error/SqlNotSupported'),
	JsonParsingError: require('./error/JsonParsingError'),
	DataSourceNotFound: require('./error/DataSourceNotFound')
};

PublicApi.version = require('../package.json').version;

module.exports = PublicApi;
