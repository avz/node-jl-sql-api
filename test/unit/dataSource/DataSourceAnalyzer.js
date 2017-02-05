'use strict';

const assert = require('assert');
const DataFunctionsRegistry = require('../../../src/dataSource/DataFunctionsRegistry');
const DataSource = require('../../../src/DataSource');
const DataSourceRead = require('../../../src/dataSource/DataSourceRead');
const DataSourceTransform = require('../../../src/dataSource/DataSourceTransform');
const DataFunctionDescription = require('../../../src/dataSource/DataFunctionDescription');
const DataSourceAnalyzer = require('../../../src/dataSource/DataSourceAnalyzer');
const NotFound = require('../../../src/error/NotFound');
const ProgramError = require('../../../src/error/ProgramError');
const TypeMismatch = require('../../../src/error/TypeMismatch');
const SqlLogicError = require('../../../src/error/SqlLogicError');
const SqlToJs = require('../../../src/SqlToJs');
const SqlNodes = require('../../../src/sql/Nodes');

describe('DataSourceAnalyzer', () => {
	describe('constructor arguments checking', () => {
		const dataFunctionsRegistry = new DataFunctionsRegistry;

		dataFunctionsRegistry.add(new DataFunctionDescription(
			DataFunctionDescription.TYPE_READ,
			'read',
			() => {

			},
			null,
			DataSource.TYPE_BINARY
		));

		dataFunctionsRegistry.add(new DataFunctionDescription(
			DataFunctionDescription.TYPE_TRANSFORM,
			'transform',
			() => {

			},
			DataSource.TYPE_BINARY,
			DataSource.TYPE_OBJECTS
		));

		dataFunctionsRegistry.add(new DataFunctionDescription(
			DataFunctionDescription.TYPE_TRANSFORM,
			'objToBin',
			() => {

			},
			DataSource.TYPE_OBJECTS,
			DataSource.TYPE_BINARY
		));

		dataFunctionsRegistry.add(new DataFunctionDescription(
			DataFunctionDescription.TYPE_TRANSFORM,
			'binToBin',
			() => {

			},
			DataSource.TYPE_BINARY,
			DataSource.TYPE_BINARY
		));

		it('default read is not TYPE_READ', () => {
			assert.throws(
				() => {
					return new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'transform', 'transform');
				},
				ProgramError
			);
		});

		it('default transform is not TYPE_TRANSFORM', () => {
			assert.throws(
				() => {
					return new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'read', 'read');
				},
				ProgramError
			);
		});

		it('default transform is not TYPE_TRANSFORM', () => {
			assert.throws(
				() => {
					return new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'read', 'read');
				},
				ProgramError
			);
		});

		it('default transform inputType !== TYPE_BINARY', () => {
			assert.throws(
				() => {
					return new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'read', 'objToBin');
				},
				ProgramError
			);
		});

		it('default transform outputType !== TYPE_OBJECTS', () => {
			assert.throws(
				() => {
					return new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'read', 'binToBin');
				},
				ProgramError
			);
		});
	});

	describe('createCallChain()', () => {
		const dataFunctionsRegistry = new DataFunctionsRegistry;

		const readObjectsDesc = new DataFunctionDescription(
			DataFunctionDescription.TYPE_READ,
			'readObjects',
			() => {},
			null,
			DataSource.TYPE_OBJECTS
		);

		const readObjectsOptsDesc = new DataFunctionDescription(
			DataFunctionDescription.TYPE_READ,
			'readObjectsOpts',
			(location, options) => {
				assert.deepStrictEqual(options, {path: location});
			},
			null,
			DataSource.TYPE_OBJECTS
		);

		const readBinaryDesc = new DataFunctionDescription(
			DataFunctionDescription.TYPE_READ,
			'readBinary',
			() => {},
			null,
			DataSource.TYPE_BINARY
		);

		const transformDesc = new DataFunctionDescription(
			DataFunctionDescription.TYPE_TRANSFORM,
			'transform',
			() => {},
			DataSource.TYPE_BINARY,
			DataSource.TYPE_OBJECTS
		);

		const transformOptsDesc = new DataFunctionDescription(
			DataFunctionDescription.TYPE_TRANSFORM,
			'transformOpts',
			(location, options) => {
				assert.deepStrictEqual(options, {path: location});
			},
			DataSource.TYPE_BINARY,
			DataSource.TYPE_OBJECTS
		);

		const transformObjObjOptsDesc = new DataFunctionDescription(
			DataFunctionDescription.TYPE_TRANSFORM,
			'transformObjObjOpts',
			(location, options) => {
				assert.deepStrictEqual(options, {path: location});
			},
			DataSource.TYPE_OBJECTS,
			DataSource.TYPE_OBJECTS
		);

		dataFunctionsRegistry.add(readObjectsDesc);
		dataFunctionsRegistry.add(readObjectsOptsDesc);
		dataFunctionsRegistry.add(readBinaryDesc);
		dataFunctionsRegistry.add(transformDesc);
		dataFunctionsRegistry.add(transformOptsDesc);
		dataFunctionsRegistry.add(transformObjObjOptsDesc);

		it('default read', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'readObjects', null);
			const stack = dsa.createCallChain(
				new SqlNodes.TableLocation(new SqlNodes.ComplexIdent(['@', 'path.json']))
			);

			assert.ok(stack instanceof DataSourceRead);
			assert.strictEqual(stack.desc, readObjectsDesc);
		});

		it('default read and transform', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'readBinary', 'transform');
			const stack = dsa.createCallChain(
				new SqlNodes.TableLocation(new SqlNodes.ComplexIdent(['@', 'path.json']))
			);

			assert.ok(stack instanceof DataSourceTransform);
			assert.strictEqual(stack.desc, transformDesc);

			assert.ok(stack.input instanceof DataSourceRead);
			assert.strictEqual(stack.input.desc, readBinaryDesc);
		});

		it('read', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, null, null);
			const stack = dsa.createCallChain(
				new SqlNodes.DataSourceCall(
					new SqlNodes.FunctionIdent(new SqlNodes.ComplexIdent(['@', 'READOBJECTSOPTS'])),
					new SqlNodes.TableLocation(new SqlNodes.ComplexIdent(['@', 'path.json'])),
					new SqlNodes.Map({path: new SqlNodes.String('"path.json"')})
				)
			);

			assert.ok(stack instanceof DataSourceRead);
			assert.strictEqual(stack.desc, readObjectsOptsDesc);
		});

		it('transform', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'readBinary', null);
			const stack = dsa.createCallChain(
				new SqlNodes.DataSourceCall(
					new SqlNodes.FunctionIdent(new SqlNodes.ComplexIdent(['@', 'TraNsFormOPTS'])),
					new SqlNodes.TableLocation(new SqlNodes.ComplexIdent(['@', 'path2.json'])),
					new SqlNodes.Map({path: new SqlNodes.String('"path2.json"')})
				)
			);

			assert.ok(stack instanceof DataSourceTransform);
			assert.strictEqual(stack.desc, transformOptsDesc);

			assert.ok(stack.input instanceof DataSourceRead);
			assert.strictEqual(stack.input.desc, readBinaryDesc);
		});

		it('transforms chain', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'readBinary', 'transform');
			const stack = dsa.createCallChain(
				new SqlNodes.DataSourceCall(
					new SqlNodes.FunctionIdent(new SqlNodes.ComplexIdent(['@', 'TraNsFormObjObjOpts'])),
					new SqlNodes.TableLocation(new SqlNodes.ComplexIdent(['@', 'path3.json'])),
					new SqlNodes.Map({path: new SqlNodes.String('"path3.json"')})
				)
			);

			assert.ok(stack instanceof DataSourceTransform);
			assert.strictEqual(stack.desc, transformObjObjOptsDesc);

			assert.ok(stack.input instanceof DataSourceTransform);
			assert.strictEqual(stack.input.desc, transformDesc);

			assert.ok(stack.input.input instanceof DataSourceRead);
			assert.strictEqual(stack.input.input.desc, readBinaryDesc);
		});

		it('wrong types', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'readObjects', null);

			assert.throws(
				() => {
					dsa.createCallChain(
						new SqlNodes.DataSourceCall(
							new SqlNodes.FunctionIdent(new SqlNodes.ComplexIdent(['@', 'transform'])),
							new SqlNodes.TableLocation(new SqlNodes.ComplexIdent(['@', 'path.json']))
						)
					);
				},
				TypeMismatch
			);
		});

		it('no default read', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, null, null);

			assert.throws(
				() => {
					dsa.createCallChain(
						new SqlNodes.TableLocation(new SqlNodes.ComplexIdent(['@', 'path.json']))
					);
				},
				ProgramError
			);
		});

		it('no default transform', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, 'readBinary', null);

			assert.throws(
				() => {
					dsa.createCallChain(
						new SqlNodes.TableLocation(new SqlNodes.ComplexIdent(['@', 'path.json']))
					);
				},
				ProgramError
			);
		});

		it('function not found', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, null, null);

			assert.throws(
				() => {
					dsa.createCallChain(
						new SqlNodes.DataSourceCall(
							new SqlNodes.FunctionIdent(new SqlNodes.ComplexIdent(['@', 'nonexistent'])),
							new SqlNodes.DataSourceCall()
						)
					);
				},
				NotFound
			);
		});

		describe('invalid arguments', () => {
			const dsa = new DataSourceAnalyzer(new SqlToJs, dataFunctionsRegistry, null, null);

			it('read from transform', () => {
				assert.throws(
					() => {
						dsa.createCallChain(
							new SqlNodes.DataSourceCall(
								new SqlNodes.FunctionIdent(new SqlNodes.ComplexIdent(['@', 'readBinary'])),
								new SqlNodes.DataSourceCall()
							)
						);
					},
					SqlLogicError
				);
			});

			it('transform with no source', () => {
				assert.throws(
					() => {
						dsa.createCallChain(
							new SqlNodes.DataSourceCall(
								new SqlNodes.FunctionIdent(new SqlNodes.ComplexIdent(['@', 'transform']))
							)
						);
					},
					SqlLogicError
				);
			});

			it('options is not object', () => {
				assert.throws(
					() => {
						dsa.createCallChain(
							new SqlNodes.DataSourceCall(
								new SqlNodes.FunctionIdent(new SqlNodes.ComplexIdent(['@', 'TraNsFormObjObjOpts'])),
								new SqlNodes.TableLocation(new SqlNodes.ComplexIdent(['@', 'path3.json'])),
								new SqlNodes.String('"path3.json"')
							)
						);
					}
				);
			});
		});
	});
});
