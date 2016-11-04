const Engine = require('./Engine');
const PublicSelect = require('./public/Select');

class PublicApi
{
	constructor()
	{
		this.engine = new Engine();
	}

	query(sql)
	{
		return new PublicSelect(this.engine.createSelect(sql));
	}
}

module.exports = PublicApi;
