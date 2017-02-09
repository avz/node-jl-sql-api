'use strict';

const assert = require('assert');
const PublicApiOptions = require('../../src/PublicApiOptions');
const DataSource = require('../../src/DataSource');
const DataFunctionDescription = require('../../src/dataSource/DataFunctionDescription');

describe('PublicApiOptions', () => {
	describe('dataFunctions', () => {
		it('short', () => {
			const fr = () => {};
			const ft = () => {};

			const o = new PublicApiOptions({
				dataFunctions: {
					read: {
						READER: fr
					},
					transform: {
						TRANSFORMER: ft
					}
				}
			});

			const reader = o.dataFunctions.read.READER;

			assert(reader instanceof DataFunctionDescription);
			assert.strictEqual(reader.type, DataFunctionDescription.TYPE_READ);
			assert.strictEqual(reader.ctor, fr);
			assert.strictEqual(reader.name, 'READER');
			assert.strictEqual(reader.inputType, null);
			assert.strictEqual(reader.outputType, DataSource.TYPE_BINARY);

			const transformer = o.dataFunctions.transform.TRANSFORMER;

			assert(transformer instanceof DataFunctionDescription);
			assert.strictEqual(transformer.type, DataFunctionDescription.TYPE_TRANSFORM);
			assert.strictEqual(transformer.ctor, ft);
			assert.strictEqual(transformer.name, 'TRANSFORMER');
			assert.strictEqual(transformer.inputType, DataSource.TYPE_BINARY);
			assert.strictEqual(transformer.outputType, DataSource.TYPE_ARRAY_OF_ROWS);
		});

		it('long', () => {
			const fr = () => {};
			const ft = () => {};

			const o = new PublicApiOptions({
				dataFunctions: {
					read: {
						READER: {
							ctor: fr,
							outputType: DataSource.TYPE_ARRAY_OF_ROWS
						}
					},
					transform: {
						TRANSFORMER: {
							ctor: ft,
							inputType: DataSource.TYPE_ARRAY_OF_ROWS,
							outputType: DataSource.TYPE_BINARY
						}
					}
				}
			});

			const reader = o.dataFunctions.read.READER;

			assert(reader instanceof DataFunctionDescription);
			assert.strictEqual(reader.type, DataFunctionDescription.TYPE_READ);
			assert.strictEqual(reader.ctor, fr);
			assert.strictEqual(reader.name, 'READER');
			assert.strictEqual(reader.inputType, null);
			assert.strictEqual(reader.outputType, DataSource.TYPE_ARRAY_OF_ROWS);

			const transformer = o.dataFunctions.transform.TRANSFORMER;

			assert(transformer instanceof DataFunctionDescription);
			assert.strictEqual(transformer.type, DataFunctionDescription.TYPE_TRANSFORM);
			assert.strictEqual(transformer.ctor, ft);
			assert.strictEqual(transformer.name, 'TRANSFORMER');
			assert.strictEqual(transformer.inputType, DataSource.TYPE_ARRAY_OF_ROWS);
			assert.strictEqual(transformer.outputType, DataSource.TYPE_BINARY);
		});

		it('errors', () => {
			assert.throws(
				() => {
					return new PublicApiOptions({
						dataFunctions: {
							read: {
								READER: {
									ctor: null
								}
							}
						}
					});
				},
				/Error in declaration of data function READER: Field ctor must be Function/
			);
		});
	});
});
