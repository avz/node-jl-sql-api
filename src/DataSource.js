'use strict';

/**
 * Аналог таблицы в SQL, отсюда берутся данные для дальнейшей обработки
 */
class DataSource
{
	/**
	 *
	 * @param {Readable} stream
	 * @param {string} alias
	 * @returns {DataSource}
	 */
	constructor(stream, alias = undefined)
	{
		this.stream = stream;
		this.alias = alias;
	}
}

DataSource.DEFAULT_NAME = '@';
DataSource.TYPE_ARRAY_OF_ROWS = 'array_of_rows';
DataSource.TYPE_BINARY = 'binary';

module.exports = DataSource;
