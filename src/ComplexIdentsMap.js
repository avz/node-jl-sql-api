class ComplexIdentsMap
{
	constructor()
	{
		this.map = {};
	}

	_key(path)
	{
		return JSON.stringify(path.map(s => s.toUpperCase()));
	}

	_unkey(key)
	{
		return JSON.parse(key);
	}

	add(path, object)
	{
		const key = this._key(path);

		if (this.map[key]) {
			throw new Error('Ident already exists: ', path.join('.§'));
		}

		this.map[key] = object;
	}

	get(path)
	{
		return this.map[this._key(path)];
	}

	need(path)
	{
		const f = this.get(path);

		if (!f) {
			throw new Error('Ident not found: ' + path.join('.'));
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

module.exports = ComplexIdentsMap;
