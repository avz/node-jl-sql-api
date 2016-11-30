'use strict';

const assert = require('assert');
const Readable = require('stream').Readable;
const DataSourceResolver = require('../../src/DataSourceResolver');
const DataSource = require('../../src/DataSource');

describe('DataSourceResolver', () => {
	class Resolver extends DataSourceResolver {
		constructor(result)
		{
			super();
			this.result = result;
		}

		resolve(location)
		{
			return this.result;
		}
	}

	const readAll = (stream, cb) => {
		const chunks = [];

		stream.on('data', d => { chunks.push(d); });
		stream.on('end', () => { cb(chunks); });
	};

	const cases = {
		'raw stream': {
			stream: new Readable({
				read() {
					this.push('{"hello": "world"}\n{"1": 2}');
					this.push(null);
				}
			}),
			output: [
				{"hello": "world"},
				{"1": 2}
			]
		},
		'object stream': {
			stream: new Readable({
				objectMode: true,
				read() {
					this.push({"hello": "world"});
					this.push({"1": 2});
					this.push(null);
				}
			}),
			output: [
				{"hello": "world"},
				{"1": 2}
			]
		}
	};

	for (const testCase in cases) {
		const inputStream = cases[testCase].stream;
		const output = cases[testCase].output;

		it(testCase, (done) => {
			const r = new Resolver(inputStream);
			const dataSource = r._resolve(['dummy']);

			assert.ok(dataSource instanceof DataSource);

			const stream = dataSource.stream;

			readAll(stream, chunks => {
				assert.ok(chunks[0] instanceof Array);
				assert.deepEqual([].concat(...chunks), output);

				done();
			});
		});
	}
});
