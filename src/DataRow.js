/**
 * Строка данных, может содержать несколько разных сырых объектов - по одному
 * на каждый DataSource
 */
class DataRow
{
	/**
	 *
	 * @param {object} sources ассоциативный массив {'@source1': {row1}, '@source2': {row2}}
	 * @returns {DataRow}
	 */
	constructor(sources)
	{
		this.sources = sources;
	}
}

DataRow.SOURCES_PROPERTY = 'sources';

module.exports = DataRow;
