/**
 * Аналог таблицы в SQL, отсюда берутся данные для дальнейшей обработки
 */
class DataStream
{
	constructor(name, stream)
	{
		this.name = name;
		this.stream = stream;
	}
}

DataStream.DEFAULT_NAME = '@';

module.exports = DataStream;
