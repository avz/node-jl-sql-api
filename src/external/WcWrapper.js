'use strict';

const ChildProcessError = require('../error/ChildProcessError');

class WcWrapper
{
	constructor()
	{
		const cmd = 'wc';
		const args = ['-l'];

		const p = require('child_process').spawn(
			cmd,
			args,
			{
				stdio: [
					'pipe',
					'pipe',
					process.stderr
				]
			}
		);

		p.on('close', (code, signal) => {
			if (code !== 0) {
				throw new ChildProcessError(cmd, args, code, signal);
			}
		});

		this.process = p;
		this.stdin = p.stdin;
		this.stdout = p.stdout;
	}
}

module.exports = WcWrapper;
