'use strict';

const assert = require('assert');
const DataFunctionDescription = require('../../../src/dataSource/DataFunctionDescription');
const DataSource = require('../../../src/DataSource');
const ProgramError = require('../../../src/error/ProgramError');

describe('DataFunctionDescription', () => {
	it('invalid type', () => {
		assert.throws(
			() => {
				return new DataFunctionDescription(
					'gagaga',
					'hi',
					() => {},
					null,
					DataSource.TYPE_BINARY
				);
			},
			ProgramError
		);
	});

	it('output type not specified', () => {
		assert.throws(
			() => {
				return new DataFunctionDescription(
					DataFunctionDescription.TYPE_READ,
					'hi',
					() => {},
					null,
					null
				);
			},
			ProgramError
		);
	});

	it('input type not specified', () => {
		assert.throws(
			() => {
				return new DataFunctionDescription(
					DataFunctionDescription.TYPE_TRANSFORM,
					'hi',
					() => {},
					null,
					DataSource.TYPE_ARRAY_OF_ROWS
				);
			},
			ProgramError
		);
	});

	it('input type specified for TYPE_READ', () => {
		assert.throws(
			() => {
				return new DataFunctionDescription(
					DataFunctionDescription.TYPE_READ,
					'hi',
					() => {},
					DataSource.TYPE_BINARY,
					DataSource.TYPE_ARRAY_OF_ROWS
				);
			},
			ProgramError
		);
	});

	it('ctor is arrow function', () => {
		const o = {};

		const f = new DataFunctionDescription(
			DataFunctionDescription.TYPE_READ,
			'HELLO',
			() => {
				return o;
			},
			null,
			DataSource.TYPE_BINARY
		);

		assert.strictEqual(f.createStream(), o);
	});

	it('ctor is ES5 function', () => {
		const o = {};

		const f = new DataFunctionDescription(
			DataFunctionDescription.TYPE_READ,
			'HELLO',
			function() {
				return o;
			},
			null,
			DataSource.TYPE_BINARY
		);

		assert.strictEqual(f.createStream(), o);
	});
});
