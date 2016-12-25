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

	/**
	 *
	 * @param {string} dataType
	 * @param {mixed} a
	 * @param {mixed} b
	 * @returns {Number}
	 */
	static compare(dataType, a, b)
	{
		if (dataType === DataType.NUMBER) {
			return Collator._compareNumbers(+a, +b);
		}

		return Collator._compareAsJson(dataType, a, b);
	}

	/**
	 *
	 * @param {string} dataType
	 * @param {mixed} value
	 * @returns {string}
	 */
	static generateKey(dataType, value)
	{
		if (dataType === DataType.NUMBER) {
			return value + '';
		} else if (dataType === DataType.STRING) {
			return Collator._generateKeyString(value);
		} else {
			return Collator._generateKeyMixed(value);
		}
	}

	static _generateKeyString(value)
	{
		/* eslint-disable indent, no-unreachable */
		switch (typeof(value)) {
			case 'string':
				return JSON.stringify(value);
			break;
			case 'number':
				return '"' + value + '"';
			break;
			case 'boolean':
				return value ? '3_true' : '2_false';
			break;
			case 'undefined':
				return '5_undefined';
			break;
			default:
				if (value === null) {
					return '4_null"';
				}

				return JSON.stringify(value);
			break;
		}
		/* eslint-enable indent, no-unreachable */
	}

	/**
	 *
	 * @param {mixed} value
	 * @returns {string}
	 */
	static _generateKeyMixed(value)
	{
		/* eslint-disable indent, no-unreachable */
		switch (typeof(value)) {
			case 'string':
				return '6_' + JSON.stringify(value);
			break;
			case 'number':
				return '5_' + value + '';
			break;
			case 'boolean':
				return value ? '4_true' : '3_false';
			break;
			case 'undefined':
				return '1_undefined';
			break;
			default:
				if (value === null) {
					return '2_null';
				}

				return '9_' + JSON.stringify(value);
			break;
		}
		/* eslint-enable indent, no-unreachable */
	}
}

module.exports = Collator;
