const Engine = require('./Engine');
const PublicSelect = require('./public/Select');

class PublicApi
{
	constructor(options = {})
	{
		this.options = options;
		this.engine = new Engine();
	}

	query(sql)
	{
		return new PublicSelect(this.engine.createSelect(sql, this.options));
	}
}

module.exports = PublicApi;
