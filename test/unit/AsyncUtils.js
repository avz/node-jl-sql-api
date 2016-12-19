'use strict';

const assert = require('assert');
const AsyncUtils = require('../../src/AsyncUtils');

describe('AsyncUtils', () => {
	describe('eachSeriesHalfSync()', () => {
		it('empty array: sync end()', (done) => {
			let sync = true;
			let once = true;

			AsyncUtils.eachSeriesHalfSync(
				[],
				(elt, next) => {
					assert.ok(false);
				},
				() => {
					assert.ok(sync);
					assert.strictEqual(once, true);
					once = false;

					done();
				}
			);

			sync = false;
		});

		it('non-empty array: sync next(), sync end()', (done) => {
			let sync = true;
			let endOnce = true;

			const input = [1, 2, 3];
			let inputOffset = 0;

			AsyncUtils.eachSeriesHalfSync(
				input,
				(elt, next) => {
					assert.ok(sync);

					assert.strictEqual(elt, input[inputOffset]);

					inputOffset++;

					next();
				},
				() => {
					assert.ok(sync);
					assert.strictEqual(endOnce, true);
					endOnce = false;

					assert.strictEqual(inputOffset, 3);

					done();
				}
			);

			sync = false;
		});

		it('async next', (done) => {
			let sync = true;
			let endOnce = true;

			const input = [1, 2, 3];
			let inputOffset = 0;

			AsyncUtils.eachSeriesHalfSync(
				input,
				(elt, next) => {
					if (inputOffset === 0) {
						assert.ok(sync);
					} else {
						assert.strictEqual(sync, false);
					}

					assert.strictEqual(elt, input[inputOffset]);

					inputOffset++;

					setImmediate(next);
				},
				() => {
					assert.strictEqual(sync, false);
					assert.strictEqual(endOnce, true);
					endOnce = false;

					assert.strictEqual(inputOffset, 3);

					done();
				}
			);

			sync = false;
		});

		it('stack does not leak (logic)', () => {
			let n = 0;

			AsyncUtils.eachSeriesHalfSync(
				[1, 2, 3],
				(elt, next) => {
					assert.strictEqual(n, 0);

					n++;
					next();
					n--;
				}
			);
		});

		it('stack does not leak (real)', () => {
			AsyncUtils.eachSeriesHalfSync(new Array(100000), () => {});

			assert.ok(true);
		});
	});
});
