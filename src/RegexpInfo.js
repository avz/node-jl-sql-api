'use strict';

class RegexpInfo
{
	constructor(source, flags, regexp)
	{
		this.source = source;
		this.flags = flags;
		this.regexp = regexp;
	}
}

module.exports = RegexpInfo;
