'use strict';

const ProgramError = require('./error/ProgramError');
const Nodes = require('./sql/Nodes');

class Binder
{
	constructor()
	{
		this.binds = new Map;
	}

	static _isListIdent(ident)
	{
		return ident.length > 2 && ident[0] === ':' && ident[1] === ':';
	}

	static _scalarValueToAst(value)
	{
		const nodes = {
			boolean: Nodes.Boolean,
			string: Nodes.String,
			number: Nodes.Number
		};

		const type = typeof(value);

		if (value === null) {

			return new Nodes.Null;
		} else if (type === 'string') {
			const sn = new Nodes.String('""');

			sn.value = value;

			return sn;
		} else if (type in nodes) {

			return new nodes[type](value);
		} else {

			throw new ProgramError('must be scalar or null');
		}
	}

	static _listValuesToAst(values)
	{
		if (!(values instanceof Array)) {
			throw new ProgramError('must be an array');
		}

		const nodes = [];

		for (const i in values) {
			try {
				nodes.push(Binder._scalarValueToAst(values[i]));
			} catch (e) {
				throw new ProgramError('value at offset #' + i + ': ' + e.message);
			}
		}

		return new Nodes.ExpressionsList(nodes);
	}

	/**
	 *
	 * @param {string} ident
	 * @param {mixed} value
	 * @returns {undefined}
	 */
	bind(ident, value)
	{
		let ast = null;

		try {
			if (Binder._isListIdent(ident)) {
				ast = Binder._listValuesToAst(value);
			} else {
				ast = Binder._scalarValueToAst(value);
			}
		} catch (e) {
			throw new ProgramError('Bind ' + ident + ': ' + e.message);
		}

		if (ident in this.binds) {
			throw new ProgramError('Duplicate bind base name: ' + ident);
		}

		this.binds[ident] = ast;
	}

	_need(ident)
	{
		if (!(ident in this.binds)) {
			throw new ProgramError('Bind ' + ident + ' is not binded');
		}

		return this.binds[ident];
	}

	expandInplace(ast)
	{
		ast.eachChildNodeRecursive(node => {
			if (node instanceof Nodes.BindingValueScalar) {

				node.expand(this._need(node.ident));
			} else if (node instanceof Nodes.BindingValueList) {

				node.expand(this._need(node.ident));
			} else if (node instanceof Nodes.BindingIdent) {

				node.expand(this._need(node.ident).value);
			} else if (node instanceof Nodes.BindingIdentList) {
				const fragments = this._need(node.ident).values.map(v => v.value);

				node.expand(fragments);
			}
		});
	}
}

module.exports = Binder;
