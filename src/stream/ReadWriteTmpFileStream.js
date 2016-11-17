'use strict';

const os = require('os');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');

class ReadWriteTmpFileStream extends EventEmitter
{
	constructor(prefix = 'node_tmp_', dir = os.tmpdir())
	{
		super();

		const p = ReadWriteTmpFileStream.generateTmpPath(dir, prefix);

		this.fd = null;

		fs.open(p, 'wx+', 0, (err, fd) => {
			if (err) {
				this.emit('error', err);

				return;
			}

			fs.unlink(p, (err) => {
				if (err) {
					this.emit('error', err);

					return;
				}

				this.fd = fd;

				this.emit('open', this.fd);
			});
		});
	}

	write(buffer, cb)
	{
		fs.write(this.fd, buffer, (err) => {
			if (cb) {
				cb(err);
			} else if (err) {
				this.emit('error', err);
			}
		});
	}

	createReadStream()
	{
		return fs.createReadStream('/nonexistent', {
			fd: this.fd,
			start: 0,
			autoClose: false
		});
	}

	closeSync()
	{
		fs.closeSync(this.fd);
		this.fd = null;
	}

	static generateTmpPath(dir, prefix)
	{
		const name = prefix + crypto.randomBytes(16).toString('hex');
		const p = path.join(dir, name);

		return p;
	}
}

module.exports = ReadWriteTmpFileStream;
