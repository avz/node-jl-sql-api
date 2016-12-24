'use strict';

/**
 * Аналог таблицы в SQL, отсюда берутся данные для дальнейшей обработки
 */
class DataSource
{
	/**
	 *
	 * @param {Readable} stream
	 * @returns {DataSource}
	 */
	constructor(stream)
	{
		this.stream = stream;
	}
}

DataSource.DEFAULT_NAME = '@';

module.exports = DataSource;
