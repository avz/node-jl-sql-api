'use strict';

const DataSource = require('./DataSource');
const DataSourceRead = require('./dataSource/DataSourceRead');
const ProgramError = require('./error/ProgramError');

class DataProvider
{
	/**
	 *
	 * @param {DataSourceAnalyzer} dataSourceAnalyzer
	 */
	constructor(dataSourceAnalyzer)
	{
		this.dataSourceAnalyzer = dataSourceAnalyzer;
	}

	/**
	 * @public
	 * @param {SqlNodes.Table} tableNode
	 * @returns {DataSource}
	 */
	getDataSource(tableNode)
	{
		const chain = this.dataSourceAnalyzer.createCallChain(tableNode.source);
		const streamsChain = this.createStreamsChain(chain);
		const stream = this.createResultStream(streamsChain);

		const resolvedAlias = streamsChain[streamsChain.length - 1].alias;
		const alias = (tableNode.alias && tableNode.alias.name) || resolvedAlias;

		return new DataSource(stream, alias);
	}

	/**
	 * @private
	 * @param {DataSourceRead|DataSourceTransform} start
	 * @returns {stream.Readable[]}
	 */
	createStreamsChain(start)
	{
		if (start instanceof DataSourceRead) {
			return [this.createStream(start.desc, start.location, start.options)];
		}

		const source = this.createStreamsChain(start.input);

		const transform = this.createStream(start.desc, source[source.length - 1], start.options);

		return source.concat([transform]);
	}

	/**
	 * @private
	 * @param {stream.Readable[]} streamsChain
	 * @returns {stream.Readable}
	 */
	createResultStream(streamsChain)
	{
		if (!streamsChain.length) {
			throw new ProgramError('Empty streams chain');
		}

		var end = streamsChain[0].stream;

		for (let i = 1; i < streamsChain.length; i++) {
			end = end.pipe(streamsChain[i].stream);
		}

		return end;
	}

	/**
	 * @private
	 * @param {DataFunctionDescription} desc
	 * @param {mixed} source
	 * @param {Object} options
	 * @returns {DataSource}
	 */
	createStream(desc, source, options)
	{
		const s = desc.createStream(source, options);
		var dataSource;

		if (s instanceof DataSource) {
			dataSource = s;
		} else {
			dataSource = new DataSource(s);
		}

		if (source instanceof DataSource) {
			dataSource.alias = source.alias;
		}

		return dataSource;
	}
}

module.exports = DataProvider;
