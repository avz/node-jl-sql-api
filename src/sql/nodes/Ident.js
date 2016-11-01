const Node = require('../Node');

class Ident extends Node
{
	constructor(name)
	{
		super();

		if(name[0] === '`') {
			name = name.substr(1, name.length - 2);
		}

		this.name = name;
	}
}

module.exports = Ident;
