'use strict';

const assert = require('assert');
const PassThrough = require('stream').PassThrough;
const JlTransformsChain = require('../../src/stream/JlTransformsChain');
const DataSource = require('../../src/DataSource');
const DataProvider = require('../../src/DataProvider');
const ProgramError = require('../../src/error/ProgramError');
const DataSourceRead = require('../../src/dataSource/DataSourceRead');
const DataSourceTransform = require('../../src/dataSource/DataSourceTransform');

describe('DataProvider', () => {
	describe('createStreamChain', () => {
		const dp = new DataProvider(null);

		it('read', () => {
			const options = {options: 'hi'};

			const r = new DataSourceRead(
				{
					createStream: (source, opts) => {
						assert.strictEqual(source, 'loc');
						assert.strictEqual(opts, options);

						return 'streamFake';
					}
				},
				'loc',
				options
			);

			const ds = dp.createStreamsChain(r);

			assert.strictEqual(ds.length, 1);
			assert.ok(ds[0] instanceof DataSource);
			assert.strictEqual(ds[0].alias, undefined);
			assert.strictEqual(ds[0].stream, 'streamFake');
		});

		it('read + transform', () => {
			const options = {options: 'hi'};

			const transform = {};
			const read = {};

			const r = new DataSourceRead(
				{
					createStream: (source, opts) => {
						return read;
					}
				},
				'',
				{}
			);

			const t = new DataSourceTransform(
				{
					createStream: (source, opts) => {
						assert.ok(source instanceof DataSource);
						assert.strictEqual(source.stream, read);
						assert.strictEqual(opts, options);

						return transform;
					}
				},
				r,
				options
			);

			const ds = dp.createStreamsChain(t);

			assert.strictEqual(ds.length, 2);
			assert.ok(ds[0] instanceof DataSource);
			assert.ok(ds[1] instanceof DataSource);
			assert.strictEqual(ds[0].stream, read);
			assert.strictEqual(ds[1].stream, transform);
		});
	});

	describe('createResultStream()', () => {
		const dp = new DataProvider(null);

		it('empty', () => {
			assert.throws(() => dp.createResultStream([]), ProgramError);
		});

		it('piping', () => {
			var pipesCount = 0;
			const third = {stream: {}};

			const second = {stream: {
				pipe: (dest) => {
					pipesCount++;
					assert.strictEqual(pipesCount, 2);
					assert.strictEqual(dest, third.stream);

					return third.stream;
				}
			}};

			const first = {stream: {
				pipe: (dest) => {
					pipesCount++;
					assert.strictEqual(pipesCount, 1);
					assert.strictEqual(dest, second.stream);

					return second.stream;
				}
			}};

			assert.strictEqual(dp.createResultStream([first, second, third]), third.stream);
			assert.strictEqual(pipesCount, 2);
		});
	});

	describe('createStream()', () => {
		const dp = new DataProvider(null);
		const desc = {
			createStream: (src, opts) => {
				return opts.stream;
			}
		};

		it('from stream', () => {
			const outStream = {};
			const source = {};

			const res = dp.createStream(desc, source, {stream: outStream});

			assert.ok(res instanceof DataSource);
			assert.strictEqual(res.stream, outStream);
		});

		it('from DataSource', () => {
			const outStream = new DataSource({}, 'hi');
			const source = {};

			const res = dp.createStream(desc, source, {stream: outStream});

			assert.ok(res instanceof DataSource);
			assert.strictEqual(res, outStream);
		});

		it('from Array', () => {
			const outStream = [new DataSource(new PassThrough, 'hi'), new PassThrough];
			const source = {};

			const res = dp.createStream(desc, source, {stream: outStream});

			assert.ok(res instanceof DataSource);
			assert.ok(res.stream instanceof JlTransformsChain);
			assert.deepStrictEqual(res.stream.streams, [outStream[0].stream, outStream[1]]);
		});
	});
});
