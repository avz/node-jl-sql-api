'use strict';

const ProgramError = require('./error/ProgramError');

class JoinOptions
{
	constructor(options)
	{
		this.maxKeysInMemory = 16000;
		this.tmpDir = null;

		for (const k in options) {
			if (!this.hasOwnProperty(k)) {
				throw new ProgramError('Unknown Join option: ' + k);
			}

			this[k] = options[k];
		}
	}
}

module.exports = JoinOptions;
