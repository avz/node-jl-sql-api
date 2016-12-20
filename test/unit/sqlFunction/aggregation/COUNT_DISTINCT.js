'use strict';

const assert = require('assert');
const CountDistinct = require('../../../../src/sqlFunctions/aggregation/COUNT_DISTINCT');
const DataType = require('../../../../src/DataType');
const AsyncUtils = require('../../../../src/AsyncUtils');

describe('SQL function COUNT_DISTINCT()', () => {
	const runWithOptions = (defaultOptions) => {
		const countAsync = (items, cb, opts = {}) => {
			const options = Object.assign(defaultOptions, opts);

			const c = new CountDistinct({options: {sortOptions: options}});

			c.init();

			AsyncUtils.eachSeriesHalfSync(
				items,
				(item, cb) => {
					c.updateAsync([item], cb);
				},
				() => {
					c.resultAsync(cb);
					c.deinit();
				}
			);
		};

		it('scalars', (done) => {
			countAsync([1, 2, 3], (c) => {
				assert.strictEqual(c, 3);
				done();
			});
		});

		it('undefined and null', (done) => {
			countAsync([1, 2, 3, undefined, null, 4], (c) => {
				assert.strictEqual(c, 4);
				done();
			});
		});

		it('empty', (done) => {
			countAsync([], (c) => {
				assert.strictEqual(c, 0);
				done();
			});
		});

		it('only nulls and undefined', (done) => {
			countAsync([null, null, undefined], (c) => {
				assert.strictEqual(c, 0);
				done();
			});
		});

		it('dataType()', () => {
			assert.strictEqual(CountDistinct.dataType(), DataType.NUMBER);
		});
	};

	describe('in memory', () => {
		runWithOptions({
			inMemoryBufferSize: 100
		});
	});

	describe('external', () => {
		runWithOptions({
			inMemoryBufferSize: 1
		});
	});
});
