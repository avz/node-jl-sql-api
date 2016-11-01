const util = require('util');

class Node
{
	type()
	{
		return this.constructor.name;
	}

	inspect(depth, opts)
	{
		var obj = {};

		for (var k in this) {
			if(this.hasOwnProperty(k))
				obj[k] = this[k];
		}

		var type = this.type();

		if (opts && opts.colors) {
			var color = util.inspect.colors[util.inspect.styles.special][0];

			type = '\x1b[' + color + 'm' + type + '\x1b[0m';
		}

		return type + ' ' + util.inspect(obj, opts);
	}

	childNodes()
	{
		return [];
	}
}

module.exports = Node;
