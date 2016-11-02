class FunctionsMap
{
	constructor()
	{
		this.map = {};
	}

	_key(path)
	{
		return JSON.stringify(path);
	}

	add(path, func)
	{
		const key = JSON.stringify(path);

		this.map[this._key(path)] = func;
	}

	get(path)
	{
		return this.map[this._key(path)];
	}

	need(path)
	{
		const f = this.get(path);

		if (!f) {
			throw new Error('Function not found: ' + path.join('.'));
		}

		return f;
	}
}

module.exports = FunctionsMap;
