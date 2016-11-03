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

	_unkey(key)
	{
		return JSON.parse(key);
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

	*[Symbol.iterator]()
	{
		for (const k in this.map) {
			yield [this._unkey(k), this.map[k]];
		}
	}
}

module.exports = FunctionsMap;
