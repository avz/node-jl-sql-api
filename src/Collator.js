'use strict';

const DataType = require('./DataType');

/**
 * Класс, который нужен для обеспечения единообразной сортировки
 * между `sort` и сравнениями в JS. `sort` использует по-байтовое
 * сравнение для JSON-кодированных значений, поэтому здесь нужно
 * сэмулировать именно его
 */
class Collator
{
	static _compareNumbers(a, b)
	{
		if (a > b) {
			return 1;
		} else if (a < b) {
			return -1;
		}

		return 0;
	}

	static _compareAsJson(dataType, a, b)
	{
		const keyA = Buffer.from(Collator.generateKey(dataType, a));
		const keyB = Buffer.from(Collator.generateKey(dataType, b));

		return Buffer.compare(keyA, keyB);
	}

	static compare(dataType, a, b)
	{
		if (dataType === DataType.NUMBER) {
			return Collator._compareNumbers(+a, +b);
		}

		return Collator._compareAsJson(dataType, a, b);
	}

	static generateKey(dataType, value)
	{
		if (dataType === DataType.NUMBER) {
			return value + '';
		}

		return Buffer.from(value === undefined ? '' : JSON.stringify(value + ''));
	}
}

module.exports = Collator;
