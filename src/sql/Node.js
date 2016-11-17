'use strict';

const util = require('util');

class Node
{
	constructor()
	{
		Node.lastId++;
		this.id = 'Node_' + Node.lastId;
	}

	type()
	{
		return this.constructor.name;
	}

	inspect(depth, opts)
	{
		var obj = {};

		for (let k in this) {
			if(this.hasOwnProperty(k)) {
				obj[k] = this[k];
			}
		}

		let type = this.type();

		if (opts && opts.colors) {
			const color = util.inspect.colors[util.inspect.styles.special][0];

			type = '\x1b[' + color + 'm' + type + '\x1b[0m';
		}

		return type + ' ' + util.inspect(obj, opts);
	}

	childNodes()
	{
		return [];
	}

	*eachChildNodeRecursive()
	{
		const childs = this.childNodes();

		for (let child of childs) {
			yield child;

			for (let subchild of child.eachChildNodeRecursive()) {
				yield subchild;
			}
		}
	}

	childNodesRecursive()
	{
		const nodes = [];

		for (let f of this.eachChildNodeRecursive()) {
			nodes.push(f);
		}

		return nodes;
	}
}

Node.lastId = 0;

module.exports = Node;
