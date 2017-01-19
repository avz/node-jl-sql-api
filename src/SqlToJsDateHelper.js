'use strict';

const Interval = require('./sql/nodes/Interval');
const ProgramError = require('./error/ProgramError');

class SqlTOJsDateHelper
{
	constructor(sqlToJs)
	{
		this.sqlToJs = sqlToJs;
	}

	_date(value)
	{
		if (value instanceof Date) {
			return new Date(value);
		}

		const r = typeof(value);

		let result = null;

		if (r === 'number') {
			result = new Date(value * 1000);
		} else if (r === 'string') {
			result = new Date(value);
		}

		if (isNaN(result.getTime())) {
			return null;
		}

		return result;
	}

	toDate(dateOrTs)
	{
		if (dateOrTs instanceof Date) {
			return dateOrTs;
		}

		return this._date(dateOrTs);
	}

	moveOnInterval(ts, intervalUnit, intervalSize)
	{
		const date = this._date(ts);

		if (!date) {
			return null;
		}

		/* eslint-disable indent */
		switch (intervalUnit) {
			case Interval.UNIT_YEAR:
				date.setFullYear(date.getFullYear() + intervalSize);
			break;
			case Interval.UNIT_MONTH:
				date.setMonth(date.getMonth() + intervalSize);
			break;
			case Interval.UNIT_DAY:
				date.setDate(date.getDate() + intervalSize);
			break;
			case Interval.UNIT_HOUR:
				date.setHours(date.getHours() + intervalSize);
			break;
			case Interval.UNIT_MINUTE:
				date.setMinutes(date.getMinutes() + intervalSize);
			break;
			case Interval.UNIT_SECOND:
				date.setSeconds(date.getSeconds() + intervalSize);
			break;
			default:
				throw new ProgramError('Unknown interval unit: ' + intervalUnit);
		}
		/* eslint-enable indent */

		return date;
	}
}

module.exports = SqlTOJsDateHelper;
