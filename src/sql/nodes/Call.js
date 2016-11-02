const Node = require('../Node');

class Call extends Node
{
	constructor(functionIdent, args)
	{
		super();

		this.function = functionIdent;
		this.args = args;
	}

	childNodes()
	{
		return [this.function].concat(this.args);
	}
}

module.exports = Call;
