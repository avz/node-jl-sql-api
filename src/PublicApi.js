const Engine = require('./Engine');
const PublicSelect = require('./public/Select');
const PublicApiOptions = require('./PublicApiOptions');

class PublicApi
{
	/**
	 *
	 * @param {PublicApiOptions} options
	 */
	constructor(options = new PublicApiOptions)
	{
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
}

module.exports = PublicApi;
