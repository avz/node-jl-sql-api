'use strict';

const AlreadyExists = require('./error/AlreadyExists');
const NotFound = require('./error/NotFound');

class ComplexIdentsMap
{
	constructor(caseSensitivity = true)
	{
		this.map = {};
		this.caseSensitivity = caseSensitivity;
	}

	_key(path)
	{
		const k = this.caseSensitivity ? path : path.map(s => s.toUpperCase());

		return JSON.stringify(k);
	}

	_unkey(key)
	{
		return JSON.parse(key);
	}

	add(path, object)
	{
		const key = this._key(path);

		if (this.map[key]) {
			throw new AlreadyExists('ident ', path.join('.'));
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
			throw new NotFound('ident ' + path.join('.'));
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
