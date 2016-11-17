'use strict';

/**
 * Аналог таблицы в SQL, отсюда берутся данные для дальнейшей обработки
 */
class DataSource
{
	constructor(stream)
	{
		this.stream = stream;
	}
}

DataSource.DEFAULT_NAME = '@';

module.exports = DataSource;
