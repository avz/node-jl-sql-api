'use strict';

const assert = require('assert');
const Engine = require('../../src/Engine');
const SqlToJs = require('../../src/SqlToJs');
const PublicApiOptions = require('../../src/PublicApiOptions');

describe('Engine', () => {
	describe('createDataProvider()', () => {
		it('defaults', () => {
			const e = new Engine;

			const dp = e.createDataProvider(new SqlToJs, null);

			assert.strictEqual(dp.dataSourceAnalyzer.defaultRead, 'INTERNAL');
			assert.strictEqual(dp.dataSourceAnalyzer.defaultTransform, null);
		});

		it('options.dataFunctions', () => {
			const e = new Engine(new PublicApiOptions({
				dataFunctions: {
					read: {
						READ: () => {}
					},
					transform: {
						TRANSFORM: () => {}
					}
				}
			}));

			const dp = e.createDataProvider(new SqlToJs, null);

			assert.strictEqual(dp.dataSourceAnalyzer.dataFunctionRegistry.need('READ').name, 'READ');
			assert.strictEqual(dp.dataSourceAnalyzer.dataFunctionRegistry.need('TRANSFORM').name, 'TRANSFORM');
		});
	});
});
