'use strict';

const ProgramError = require('./error/ProgramError');

class SortOptions
{
	constructor(options = {})
	{
		this.path = 'sort';
		this.unique = false;
		this.numeric = false;
		this.reverse = false;
		this.stable = false;
		this.merge = false;
		this.ignoreCase = false;
		this.sortByHash = false;
		this.tmpDir = null;
		this.bufferSize = 64 * 1024 * 1024;
		this.separator = '\t';
		this.threads = null;
		this.keys = [];

		this.inMemoryBufferSize = 16000;
		this.forceInMemory = undefined;

		for (const k in options) {
			if (!this.hasOwnProperty(k)) {
				throw new ProgramError('Unknown option: ' + k);
			}

			this[k] = options[k];
		}
	}

	/**
	 *
	 * @returns {SortOptions}
	 */
	clone()
	{
		return new SortOptions(this);
	}
}

module.exports = SortOptions;
