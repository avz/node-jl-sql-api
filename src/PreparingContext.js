/**
 * Контекст, который используется на этапе подготовки запроса.
 * В него входит, например, список обычных и агрегирующийх функций,
 * доступных в системе
 */
class PreparingContext
{
	constructor(sqlToJs, functionsMap)
	{
		this.sqlToJs = sqlToJs;
		this.functionsMap = functionsMap;
	}
}

module.exports = PreparingContext;
