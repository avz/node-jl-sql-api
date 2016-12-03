'use strict';

const ComplexIdent = require('./ComplexIdent');

class TableLocation extends ComplexIdent
{
	constructor(complexIdent)
	{
		super([]);

		const fragments = complexIdent.fragments.slice();
		const source = fragments.shift();

		if (source !== '@') {
			throw new Error('Invalid table location');
		}

		this.fragments = fragments;
	}
}

module.exports = TableLocation;
