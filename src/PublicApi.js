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
		if (!(options instanceof PublicApiOptions)) {
			options = new PublicApiOptions(options);
		}

		this.options = options;
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
