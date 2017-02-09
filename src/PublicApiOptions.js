'use strict';

const assert = require('assert');
const SortOptions = require('./SortOptions');
const JoinOptions = require('./JoinOptions');
const DataSource = require('./DataSource');
const ProgramError = require('./error/ProgramError');
const DataFunctionDescription = require('./dataSource/DataFunctionDescription');

class PublicApiOptions
{
	constructor(options = {})
	{
		this.tmpDir = null;
		this.forceInMemory = undefined;
		this.sortOptions = null;
		this.joinOptions = null;
		this.dataSourceResolvers = [];
		this.dataFunctions = {
			read: {},
			transform: {}
		};

		this.dataFunctionsDefaults = {
			read: 'INTERNAL',
			transform: null
		};

		for (const k in options) {
			if (!this.hasOwnProperty(k)) {
				throw new ProgramError('Unknown API option: ' + k);
			}

			this[k] = options[k];
		}

		for (const name in this.dataFunctions.read) {
			const decl = this.dataFunctions.read[name];

			this.dataFunctions.read[name] = PublicApiOptions.dataFunctionDeclarationToDescription(
				DataFunctionDescription.TYPE_READ,
				name,
				decl
			);
		}

		for (const name in this.dataFunctions.transform) {
			const decl = this.dataFunctions.transform[name];

			this.dataFunctions.transform[name] = PublicApiOptions.dataFunctionDeclarationToDescription(
				DataFunctionDescription.TYPE_TRANSFORM,
				name,
				decl
			);
		}

		if (!options.sortOptions) {
			this.sortOptions = new SortOptions({});
		} else if (!(options.sortOptions instanceof SortOptions)) {
			this.sortOptions = new SortOptions(options.sortOptions);
		}

		if (!options.joinOptions) {
			this.joinOptions = new JoinOptions({});
		} else if (!(options.sortOptions instanceof JoinOptions)) {
			this.joinOptions = new JoinOptions(options.joinOptions);
		}

		if (this.tmpDir) {
			if (!(options.sortOptions && options.sortOptions.tmpDir)) {
				this.sortOptions.tmpDir = this.tmpDir;
			}

			if (!(options.joinOptions && options.joinOptions.tmpDir)) {
				this.joinOptions.tmpDir = this.tmpDir;
			}
		}

		if (this.forceInMemory !== undefined) {
			if (this.sortOptions.forceInMemory === undefined) {
				this.sortOptions.forceInMemory = this.forceInMemory;
			}

			if (this.joinOptions.forceInMemory === undefined) {
				this.joinOptions.forceInMemory = this.forceInMemory;
			}
		}
	}

	/**
	 * @private
	 * @param {string} type
	 * @param {Function|object} decl
	 * @returns {DataFunctionDeclaration}
	 */
	static dataFunctionDeclarationToDescription(type, name, decl)
	{
		let desc;

		try {
			if (decl instanceof Function) {
				let inputType = null;
				let outputType = null;

				if (type === DataFunctionDescription.TYPE_READ) {
					inputType = null;
					outputType = DataSource.TYPE_BINARY;
				} else if (type === DataFunctionDescription.TYPE_TRANSFORM) {
					inputType = DataSource.TYPE_BINARY;
					outputType = DataSource.TYPE_ARRAY_OF_ROWS;
				} else {
					assert.ok(false, 'Unknown type: ' + type);
				}

				desc = new DataFunctionDescription(type, name, decl, inputType, outputType);
			} else {
				assert(decl.ctor instanceof Function, 'Field ctor must be Function');

				if (type === DataFunctionDescription.TYPE_READ) {
					assert.ok(
						decl.inputType === null || decl.inputType === undefined,
						'Field `inputType` must be undefined or null'
					);
				} else {
					assert.ok(
						typeof(decl.inputType) === 'string',
						'Field `inputType` must be specified and be string'
					);
				}

				assert.ok(
					typeof(decl.outputType) === 'string',
					'Field `outputType` must be specified and be string'
				);

				desc = new DataFunctionDescription(type, name, decl.ctor, decl.inputType || null, decl.outputType);
			}
		} catch (e) {
			e.message = 'Error in declaration of data function ' + name + ': ' + e.message;

			throw e;
		}

		return desc;
	}
}

module.exports = PublicApiOptions;
