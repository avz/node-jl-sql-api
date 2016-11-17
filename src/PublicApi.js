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
		return new PublicSelect(this.engine.createSelect(sql, this.options));
	}

	explain(select)
	{
		const e = new Explainer();

		return e.createExplain(select);
	}
}

module.exports = PublicApi;
