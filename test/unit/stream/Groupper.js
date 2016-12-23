'use strict';

const assert = require('assert');
const Groupper = require('../../../src/stream/Groupper');

describe('Groupper', () => {
	const keyGenerator = (row) => {
		return row.key;
	};

	const createAggregator = () => {
		return {
			actions: [],
			resultCounter: 0,
			key: undefined,

			init: function(...args) {
				this.actions.push(['init', args]);
			},
			update: function(...args) {
				const cb = args[1];

				this.actions.push(['update', args.slice(0, -1)]);
				this.key = args[0].key;

				cb();
			},
			result: function(cb) {
				this.actions.push(['result', []]);

				this.resultCounter++;

				cb(this.key);
			},
			deinit: function(...args) {
				this.actions.push(['deinit', args]);
			}
		};
	};

	const runGroupper = (input, onResult) => {

		const aggregator = createAggregator();
		const g = new Groupper(keyGenerator, aggregator);

		let result = [];

		g.on('data', (data) => {
			result = result.concat(data);
		});

		g.on('end', () => {
			onResult(result, aggregator.actions);
		});

		g.end(input);
	};

	describe('aggregator calls', () => {
		it('empty input', (done) => {
			runGroupper([], (result, actions) => {
				assert.deepStrictEqual(result, []);
				assert.deepStrictEqual(actions, []);

				done();
			});
		});

		it('single row', (done) => {
			runGroupper([{key: 1}], (result, actions) => {
				assert.deepStrictEqual(result, [1]);

				assert.deepStrictEqual(actions, [
					['init', []],
					['update', [{key: 1}]],
					['result', []],
					['deinit', []]
				]);

				done();
			});
		});

		it('single group', (done) => {
			runGroupper([{key: 1, id: 1}, {key: 1, id: 2}], (result, actions) => {
				assert.deepStrictEqual(result, [1]);

				assert.deepStrictEqual(actions, [
					['init', []],
					['update', [{key: 1, id: 1}]],
					['update', [{key: 1, id: 2}]],
					['result', []],
					['deinit', []]
				]);

				done();
			});
		});

		it('multiple groups', (done) => {
			runGroupper([{key: 1, id: 1}, {key: 1, id: 2}, {key: 2, id: 3}], (result, actions) => {
				assert.deepStrictEqual(result, [1, 2]);

				assert.deepStrictEqual(actions, [
					['init', []],
					['update', [{key: 1, id: 1}]],
					['update', [{key: 1, id: 2}]],
					['result', []],
					['deinit', []],
					['init', []],
					['update', [{key: 2, id: 3}]],
					['result', []],
					['deinit', []]
				]);

				done();
			});
		});

		it('null/undefined/""/NaN/... must be different keys', (done) => {
			const input = [
				{key: '', id: 1},
				{key: null, id: 2},
				{key: undefined, id: 3},
				{id: 4},
				{key: NaN, id: 5},
				{key: NaN, id: 6},
				{key: false, id: 7}
			];

			runGroupper(input, (result, actions) => {
				// deepStrictEqual() fails on NaN

				assert.strictEqual(result[0], '');
				assert.strictEqual(result[1], null);
				assert.strictEqual(result[2], undefined);
				assert.ok(typeof(result[3]) === 'number' && isNaN(result[3]));
				assert.strictEqual(result[4], false);

				done();
			});
		});
	});
});
