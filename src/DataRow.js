'use strict';

/**
 * Строка данных, может содержать несколько разных сырых объектов - по одному
 * на каждый DataSource.
 *
 * Этот класс может сериализоваться в JSON и десериализоваться в обычный JS-объект,
 * так что не стоит добавлять сюда методы, которые могут быть вызваны после десериализации.
 */
class DataRow
{
	/**
	 *
	 * @param {object} sources key-value object {'@source1': {row1}, '@source2': {row2}}
	 * @returns {DataRow}
	 */
	constructor(sources)
	{
		this.sources = sources;
		this.aggregationCache = {};
	}

	/**
	 *
	 * @param {Object} row
	 * @returns {DataRow}
	 */
	static wrap(row)
	{
		return new DataRow({'@': row});
	}
}

DataRow.SOURCES_PROPERTY = 'sources';
DataRow.AGGREGATION_CACHE_PROPERTY = 'aggregationCache';

module.exports = DataRow;
