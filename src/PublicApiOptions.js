'use strict';

const SortOptions = require('./SortOptions');
const JoinOptions = require('./JoinOptions');
const ProgramError = require('./error/ProgramError');

class PublicApiOptions
{
	constructor(options = {})
	{
		this.externalSort = false;
		this.tmpDir = null;
		this.sortOptions = null;
		this.joinOptions = null;
		this.dataSourceResolvers = [];

		for (const k in options) {
			if (!this.hasOwnProperty(k)) {
				throw new ProgramError('Unknown API option: ' + k);
			}

			this[k] = options[k];
		}

		if (!options.sortOptions) {
			this.sortOptions = new SortOptions({});
		} else if (!(options.sortOptions instanceof SortOptions)) {
			this.sortOptions = new SortOptions(options.sortOptions);
		}

		if (!options.joinOptions) {
			this.joinOptions = new JoinOptions({});
		} else if (!(options.sortOptions instanceof JoinOptions)) {
			this.joinOptions = new JoinOptions(options.joinOptions);
		}

		if (this.tmpDir) {
			if (!options.sortOptions.tmpDir) {
				options.sortOptions.tmpDir = this.tmpDir;
			}

			if (!options.joinOptions.tmpDir) {
				options.joinOptions.tmpDir = this.tmpDir;
			}
		}
	}
}

module.exports = PublicApiOptions;
