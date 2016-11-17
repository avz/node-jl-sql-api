'use strict';

class ChildProcessError extends Error
{
	constructor(cmd, args, statusCode, signal)
	{
		super('Error executing command `' + cmd + '`'
				+ '(status=' + statusCode + ', signal=' + signal + ') with args ' + JSON.stringify(args)
		);
	}
}

module.exports = ChildProcessError;
