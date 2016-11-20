'use strict';

const JlException = require('./JlException');

class ChildProcessError extends JlException
{
	constructor(cmd, args, statusCode, signal)
	{
		super('Error executing command `' + cmd + '`'
				+ '(status=' + statusCode + ', signal=' + signal + ') with args ' + JSON.stringify(args)
		);
	}
}

module.exports = ChildProcessError;
