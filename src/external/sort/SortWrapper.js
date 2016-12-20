'use strict';

const ChildProcessError = require('../../error/ChildProcessError');

class SortWrapper
{
	/**
	 * @param {SortOptions} options
	 */
	constructor(options)
	{
		var sortCmd = options.path || 'sort';

		var argsHash = {
			'-u': !!options.unique,
			'-n': !!options.numeric,
			'-r': !!options.reverse,
			'-s': !!options.stable,
			'-m': !!options.merge,
			'-i': !!options.ignoreCase,
			'-R': !!options.sortByHash,
			'-T': options.tmpDir,
			'-S': options.bufferSize ? options.bufferSize + 'b' : null,
			'-t': options.separator,
			'--parallel': options.threads,
	//		'--compress-program': options.compress
		};

		const args = [];

		for (const opt in argsHash) {
			const optval = argsHash[opt];

			if (optval === null || optval === undefined || optval === false) {
				continue;
			}

			if (optval === true) {
				args.push(opt);
			} else {
				args.push(opt);
				args.push(optval.toString());
			}
		}

		if (options.keys) {
			for (const keydef of options.keys) {
				args.push('-k');
				args.push(keydef);
			}
		}

		const p = this._runSimple(
			sortCmd,
			args
		);

		p.on('close', function(code, signal) {
			if (code !== 0) {
				throw new ChildProcessError(sortCmd, args, code, signal);
			}
		});

		this.process = p;
		this.stdin = p.stdin;
		this.stdout = p.stdout;
	}

	_runSimple(cmd, args)
	{
		const options = {
			stdio: [
				'pipe',
				'pipe',
				process.stderr
			],
			env: {
				LC_ALL: 'C'
			}
		};

		var p = require('child_process').spawn(
			cmd,
			args,
			options
		);

		return p;
	}
}

module.exports = SortWrapper;
