'use strict';

const assert = require('assert');
const LineSplitter = require('../../../src/stream/LinesSplitter');

describe('LineSplitter', () => {
	describe('miltibyte', () => {
		var result = [];
		const ls = new LineSplitter;

		before((done) => {
			ls.on('data', (lines) => {
				result = result.concat(lines);
			});

			ls.on('end', done);

			ls.write(Buffer.from('hello\nworld\n'));
			ls.write(Buffer.from([0xd0, 0xbf, 0xd1]));
			ls.write(Buffer.from([0x80, 0x0a]));
			ls.write(Buffer.from([0xd0]));
			ls.write(Buffer.from([0xb8]));
			ls.write(Buffer.from([0xd0]));
			ls.write(Buffer.from([0xb2]));
			ls.write(Buffer.from([0x0a, 0xd0]));
			ls.write(Buffer.from([0xb5, 0xd1, 0x82, 0x0a, 0xd0, 0xbc, 0xd0, 0xb8, 0xd1, 0x80, 0x0a]));

			ls.end();
		});

		it('splitted in middle of character', () => {
			assert.deepStrictEqual(result, ['hello', 'world', 'пр', 'ив', 'ет', 'мир']);
		});
	});
});
