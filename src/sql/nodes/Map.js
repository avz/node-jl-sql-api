'use strict';

const Node = require('../Node');

class Map extends Node
{
	constructor(map)
	{
		super();

		this.map = map;
	}

	childNodes()
	{
		const values = [];

		for (const k in this.map) {
			values.push(this.map[k]);
		}

		return values;
	}
}

module.exports = Map;
