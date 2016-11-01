const Node = require('../Node');

class Limit extends Node
{
	constructor(count, offset)
	{
		super();

		this.count = count === undefined ? null : count;
		this.offset = offset === undefined ? null : offset;
	}
}

module.exports = Limit;
