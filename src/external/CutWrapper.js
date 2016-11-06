class CutWrapper
{
	constructor(columnSeparator, columnsDef)
	{
		const p = require('child_process').spawn(
			'cut',
			['-d', columnSeparator, '-f', columnsDef],
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
				throw new Error('cut error: code=' + code + ', signal=' + signal);
			}
		})

		this.process = p;
		this.stdin = p.stdin;
		this.stdout = p.stdout;
	}
}

module.exports = CutWrapper;