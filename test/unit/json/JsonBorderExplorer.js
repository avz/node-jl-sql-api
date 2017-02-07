'use strict';

const assert = require('assert');
const JsonBorderExplorer = require('../../../src/json/JsonBorderExplorer');

describe('JsonBorderExplorer', () => {
	const chunks = (string, sizeFrom, sizeTo = sizeFrom) => {
		const bytes = Buffer.from(string);
		const chunks = [];

		var off = 0;

		while (off < bytes.length) {
			const chunkSize = Math.floor(Math.random() * (sizeTo - sizeFrom)) + sizeFrom;

			chunks.push(bytes.slice(off, off + chunkSize));

			off += chunkSize;
		}

		return chunks;
	};

	const parse = (bufs) => {
		const je = new JsonBorderExplorer;

		var off = 0;
		var lastOff = 0;

		var head = [];
		const jsons = [];

		for (const buf of bufs) {
			off = 0;
			lastOff = 0;

			while ((off = je.write(buf, off)) !== -1) {
				if (head.length) {
					head.push(buf.slice(0, off));

					jsons.push(Buffer.concat(head).toString());

					head = [];
					lastOff = off;

					continue;
				}

				const json = buf.toString('utf8', lastOff, off);

				jsons.push(json);

				lastOff = off;
			}

			head.push(buf.slice(lastOff));
		}

		off = je.end();

		if (off !== -1) {
			if (head.length) {
				jsons.push(Buffer.concat(head).toString());
			}
		}

		return jsons;
	};

	describe('valid', () => {
		const cases = [
			['{}'],
			['[{}]', '  [   {  }   ]'],
			['[{"a":[{}]}]', '[ { "a"  : [ {  } ] }  ]'],
			['[{"a":[{"привет":"мир"}]}]', '[{"a"\n:\t[\n{\t\t"привет": "мир"  }]}]'],
			['[{"a":[{"п\\\\р\\"и\\вет\\"":"мир\\""}]}]', '[{"a"\n:\t[\n{\t\t"привет": "мир"  }]}]'],
			['{"A":"b", "c": "d"}'],
			['[1, 2, 3]'],
			['123'],
			['null'],
			['false'],
			['true'],
			['1234'],
			['1234.12e-2'],
			['-1234.12e-2'],
			['0'],
			['2e+3'],
			['2e3'],
			['[]']
		];

		const chunkSizes = [
			[1],
			[2],
			[3],
			[4],
			[100500],
			[1, 3],
			[2, 5]
		];

		var cn = 0;

		for (const c of cases) {
			const caseString = c.join('');

			cn++;

			it('case #' + cn, () => {
				for (const size of chunkSizes) {
					const bufs = chunks(caseString, ...size);
					const jsons = parse(bufs);

					assert.deepStrictEqual(jsons, c);
				}
			});
		}
	});

	describe('invalid', () => {
		const cases = [
			['{{}}', /Object key expected/],
			['"hello\\"', /Unexpected end of JSON, expected ending of: string/],
			['"hello', /Unexpected end of JSON, expected ending of: string/],
			['[', /Unexpected end of JSON, expected ending of: array/],
			[']', /Unexpected character: ]/],
			['{', /Unexpected end of JSON, expected ending of: object/],
			['}', /Unexpected character: }/],
			['{"hello"}', /Colon expected after object key/],
			['{10:11}', /Object key expected/],
			['{"aaa":"bbb"ccc}', /Comma or end of object expected/],
			['[1, 2"hello"]', /Comma or end of array expected/],
			['nul', /Unexpected end of JSON, expected ending of: nul/],
			['tru', /Unexpected end of JSON, expected ending of: true/],
			['fa', /Unexpected end of JSON, expected ending of: false/]
		];

		var cn = 0;

		for (const c of cases) {
			cn++;

			it('case #' + cn, () => {
				assert.throws(
					() => {
						parse([Buffer.from(c[0])]);
					},
					c[1]
				);
			});
		}
	});
});
