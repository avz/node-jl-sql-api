const SortOptions = require('./external/sort/SortOptions');

class PublicApiOptions
{
	constructor(options = {})
	{
		this.externalSort = false;
		this.sortOptions = null;

		for (const k in options) {
			if (!this.hasOwnProperty(k)) {
				throw new Error('Unknown option: ' + k);
			}

			this[k] = options[k];
		}

		if (!options.sortOptions) {
			this.sortOptions = new SortOptions({});
		} else if(options.sortOptions instanceof SortOptions) {
			this.sortOptions = new SortOptions(options.sortOptions);
		}
	}
}

module.exports = PublicApiOptions;
