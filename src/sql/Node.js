'use strict';

const util = require('util');
const ImplementationRequired = require('../error/ImplementationRequired');

class Node
{
	constructor()
	{
		Node.lastId++;
		this.id = 'Node_' + Node.lastId;
	}

	/**
	 *
	 * @returns {string}
	 */
	type()
	{
		return this.constructor.name;
	}

	/**
	 * Must be overrided in bracket-like nodes
	 * @returns {string}
	 */
	deepType()
	{
		return this.type();
	}

	inspect(depth, opts)
	{
		var obj = {};

		for (const k in this) {
			if (this.hasOwnProperty(k)) {
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

	/**
	 * @returns {Node[]}
	 */
	childNodes()
	{
		throw new ImplementationRequired(this.type() + '::childNodes()');
	}

	eachChildNodeRecursive(cb)
	{
		const childs = this.childNodes();

		for (const child of childs) {
			cb(child);

			child.eachChildNodeRecursive(cb);
		}
	}

	/**
	 *
	 * @returns {Node[]}
	 */
	childNodesRecursive()
	{
		const nodes = [];

		this.eachChildNodeRecursive(f => {
			nodes.push(f);
		});

		return nodes;
	}

	/**
	 *
	 * @returns {Node}
	 */
	clone()
	{
		const clone = (value) => {
			const type = typeof(value);

			if (type === 'object') {
				if (value === null) {

					return null;
				} else if (value instanceof Node) {

					return value.clone();
				} else if (value instanceof Array) {

					return value.slice().map(clone);
				} else {
					const copy = {};

					for (const name in value) {
						copy[name] = clone(value[name]);
					}

					return copy;
				}
			} else {
				return value;
			}
		};

		const copy = Object.create(this.constructor.prototype);

		for (const k in this) {
			copy[k] = clone(this[k]);
		}

		Node.lastId++;
		copy.id = Node.lastId;

		return copy;
	}
}

Node.lastId = 0;

module.exports = Node;
