'use strict';

const SqlNodes = require('../sql/Nodes');
const SqlLogicError = require('../error/SqlLogicError');
const DataSourceRead = require('./DataSourceRead');
const DataSourceTransform = require('./DataSourceTransform');
const DataSource = require('../DataSource');
const TypeMismatch = require('../error/TypeMismatch');
const ProgramError = require('../error/ProgramError');

class DataSourceAnalyzer
{
	/**
	 * @param {SqlToJs} sqlToJs
	 * @param {DataFunctionRegistry} dataFunctionRegistry
	 * @param {string|null} defaultRead
	 * @param {string|null} defaultTransform
	 */
	constructor(sqlToJs, dataFunctionRegistry, defaultRead, defaultTransform)
	{
		if (defaultRead) {
			if (!dataFunctionRegistry.need(defaultRead).isRead()) {
				throw new ProgramError('Default read function must be type TYPE_ROW or TYPE_ARRAY_OF_ROWS');
			}
		}

		if (defaultTransform) {
			const defaultTransformDesc = dataFunctionRegistry.need(defaultTransform);

			if (!defaultTransformDesc.isTransform()) {
				throw new ProgramError('Default transform function must be type TYPE_TRANSFORM');
			}

			if (defaultTransformDesc.inputType !== DataSource.TYPE_BINARY) {
				throw new ProgramError('Default transform inputType must be DataSource.TYPE_BINARY');
			}

			if (defaultTransformDesc.outputType !== DataSource.TYPE_ARRAY_OF_ROWS) {
				throw new ProgramError('Default transform outputType must be DataSource.TYPE_ROWS');
			}
		}

		this.sqlToJs = sqlToJs;
		this.dataFunctionRegistry = dataFunctionRegistry;

		this.defaultRead = defaultRead;
		this.defaultTransform = defaultTransform;
	}

	/**
	 * @private
	 * @param {Node} expression
	 * @returns {DataSourceTransform|DataSourceRead}
	 */
	makeCallStack(expression)
	{
		if (expression instanceof SqlNodes.TableLocation) {
			return this.createDefaultRead(expression.fragments);
		}

		if (!(expression instanceof SqlNodes.DataSourceCall)) {
			throw new ProgramError('Unknown data source node type: ' + expression.type());
		}

		const desc = this.dataFunctionRegistry.need(expression.function.fragments);
		const options = this.extractOptions(expression.options);

		if (desc.isRead()) {
			if (expression.source instanceof SqlNodes.DataSourceCall) {
				throw new SqlLogicError('Invalid argument of read function ' + desc.name);
			}

			const p = expression.source ? expression.source.fragments : null;

			return this.createRead(desc.name, p, options);

		} else if (desc.isTransform()) {
			if (!expression.source) {
				throw new SqlLogicError('Transform function ' + desc.name + ' need source argument');
			}

			const source = this.needTypedStream(this.makeCallStack(expression.source), desc.inputType);

			return this.createTransform(desc.name, source, options);

		} else {
			throw new ProgramError('Unknown description type: ' + desc.type);
		}
	}

	/**
	 * @public
	 * @param {type} expression
	 * @returns {DataSourceTransform|DataSourceRead}
	 */
	createCallChain(expression)
	{
		const tree = this.makeCallStack(expression);

		return this.needTypedStream(tree, DataSource.TYPE_ARRAY_OF_ROWS);
	}

	/**
	 * @private
	 * @param {DataSourceRead|DataSourceTransform} source
	 * @param {string} type
	 * @returns {DataSourceRead|DataSourceTransform}
	 */
	needTypedStream(source, type)
	{
		if (source.desc.outputType === type) {
			return source;
		}

		if (type === DataSource.TYPE_ARRAY_OF_ROWS) {
			return this.createDefaultTransform(source);
		}

		throw new TypeMismatch(source.desc.outputType, type);
	}

	/**
	 * @private
	 * @param {string} name
	 * @param {string[]} location
	 * @param {object} options
	 * @returns {DataSourceRead}
	 */
	createRead(name, location, options)
	{
		const desc = this.dataFunctionRegistry.need(name);

		if (location) {
			const p = [];

			for (const fragment of location) {
				if (fragment instanceof SqlNodes.BindingIdent) {
					p.push(fragment.binded);
				} else {
					p.push(fragment);
				}
			}

			return new DataSourceRead(desc, p, options);
		}

		return new DataSourceRead(desc, null, options);
	}

	/**
	 * @private
	 * @param {string[]} location
	 * @returns {DataSourceRead}
	 */
	createDefaultRead(location)
	{
		if (!this.defaultRead) {
			throw new ProgramError('Default read function is not specified');
		}

		return this.createRead(this.defaultRead, location, {});
	}

	/**
	 * @private
	 * @param {string} name
	 * @param {DataSourceTransform|DataSourceRead} source
	 * @param {object} options
	 * @returns {DataSourceTransform}
	 */
	createTransform(name, source, options)
	{
		const desc = this.dataFunctionRegistry.need(name);

		return new DataSourceTransform(desc, source, options);
	}

	/**
	 * @private
	 * @param {DataSourceTransform|DataSourceRead} source
	 * @returns {DataSourceTransform}
	 */
	createDefaultTransform(source)
	{
		if (!this.defaultTransform) {
			throw new ProgramError('Default transform function is not specified');
		}

		return this.createTransform(this.defaultTransform, source, {});
	}

	/**
	 * @private
	 * @param {Node|null} optionsNode
	 * @returns {object}
	 */
	extractOptions(optionsNode)
	{
		if (!optionsNode) {
			return {};
		}

		const options = this.sqlToJs.nodeToFunction(optionsNode)();

		if (typeof(options) !== 'object' || options === null) {
			throw new ProgramError('Options must be an object');
		}

		return options;
	}
}

module.exports = DataSourceAnalyzer;
