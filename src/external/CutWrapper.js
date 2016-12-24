'use strict';

const ChildProcessError = require('../error/ChildProcessError');

class CutWrapper
{
	/**
	 *
	 * @param {string} columnSeparator
	 * @param {string} columnsDef
	 * @returns {CutWrapper}
	 */
	constructor(columnSeparator, columnsDef)
	{
		const cmd = 'cut';
		const args = ['-d', columnSeparator, '-f', columnsDef];

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

module.exports = CutWrapper;
