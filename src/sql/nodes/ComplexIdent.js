'use strict';

const Node = require('../Node');
const BindingIdent = require('./BindingIdent');
const Ident = require('./Ident');
const BindingIdentList = require('./BindingIdentList');
const ProgramError = require('../../error/ProgramError');

class ComplexIdent extends Node
{
	constructor(fragments)
	{
		super();

		this.fragments = [];

		for (const fragment of fragments) {
			this.addFragment(fragment);
		}
	}

	addFragment(fragment)
	{
		if (fragment instanceof BindingIdent || fragment instanceof BindingIdentList) {
			this.fragments.push(fragment);
		} else if (fragment instanceof Ident) {
			this.fragments.push(fragment.name);
		} else { // string
			this.fragments.push(Ident._unquote(fragment));
		}
	}

	getFragments()
	{
		const strings = [];

		for (const f of this.fragments) {
			if (f instanceof BindingIdent) {
				const binded = f.binded;

				if (binded === null) {
					throw new ProgramError('Binds not expanded');
				}

				strings.push(binded);
			} else if (f instanceof BindingIdentList) {
				const binded = f.binded;

				if (binded === null) {
					throw new ProgramError('Binds not expanded');
				}

				strings.push(...binded);
			} else {
				strings.push(f);
			}
		}

		return strings;
	}

	childNodes()
	{
		const childs = [];

		for (const f of this.fragments) {
			if (typeof(f) === 'object' && f !== null) {
				childs.push(f);
			}
		}

		return childs;
	}
}

module.exports = ComplexIdent;
