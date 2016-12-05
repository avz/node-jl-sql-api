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
		const keyA = Collator.generateKey(dataType, a);
		const keyB = Collator.generateKey(dataType, b);

		/*
		 * JS uses simple string comparsion algo, which is identical to byte-by-byte
		 * comparsion of UTF-8 encoded strings used in `LANG=C sort`
		 * http://www.ecma-international.org/ecma-262/6.0/#sec-abstract-relational-comparison Note 2
		 */

		if (keyA > keyB) {
			return 1;
		} else if (keyA < keyB) {
			return -1;
		}

		return 0;
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

		return value === undefined ? '' : JSON.stringify(value + '');
	}
}

module.exports = Collator;
