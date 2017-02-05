'use strict';

const assert = require('assert');
const DataFunctionsRegistry = require('../../../src/dataSource/DataFunctionsRegistry');
const DataSource = require('../../../src/DataSource');
const DataFunctionDescription = require('../../../src/dataSource/DataFunctionDescription');
const NotFound = require('../../../src/error/NotFound');
const AlreadyExists = require('../../../src/error/AlreadyExists');

describe('DataFunctionsRegistry', () => {
	const f = new DataFunctionDescription(
		DataFunctionDescription.TYPE_READ,
		'EXISTS',
		() => {},
		null,
		DataSource.TYPE_BINARY
	);

	describe('need()', () => {
		const r = new DataFunctionsRegistry;

		r.add(f);

		it('string argument', () => {
			assert.strictEqual(r.need('EXISTS'), f);
			assert.strictEqual(r.need('EXiSTS'), f);
		});

		it('array argument', () => {
			assert.strictEqual(r.need(['EXISTS']), f);
			assert.strictEqual(r.need(['ExISTS']), f);
		});

		it('not found', () => {
			assert.throws(
				() => {
					r.need('nonexistent');
				},
				NotFound
			);
		});
	});

	describe('add()', () => {
		it('duplicate', () => {
			assert.throws(
				() => {
					const r = new DataFunctionsRegistry;

					r.add(f);
					r.add(f);
				},
				AlreadyExists
			);
		});
	});
});
