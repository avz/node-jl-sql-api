
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
	}
}

module.exports = PublicApiOptions;
