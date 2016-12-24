'use strict';

const PublicApiOptions = require('./PublicApiOptions');

/**
 * Контекст, который используется на этапе подготовки запроса.
 * В него входит, например, список обычных и агрегирующийх функций,
 * доступных в системе
 */
class PreparingContext
{
	/**
	 *
	 * @param {SqlToJs} sqlToJs
	 * @param {FunctionsMap} functionsMap
	 * @returns {PreparingContext}
	 */
	constructor(sqlToJs, functionsMap)
	{
		this.sqlToJs = sqlToJs;
		this.functionsMap = functionsMap;

		/**
		 * @type {PublicApiOptions}
		 */
		this.options = new PublicApiOptions;
	}
}

module.exports = PreparingContext;
