'use strict';

const DataType = require('./DataType');
const NumberUtils = require('./NumberUtils');
const STRING = require('./sqlFunctions/basic/STRING');

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

	static _compareSortAsJson(dataType, a, b)
	{
		const keyA = Collator.generateSortKey(dataType, a);
		const keyB = Collator.generateSortKey(dataType, b);

		/*
		 * JS uses simple string comparison algo, which is identical to byte-by-byte
		 * comparison of UTF-8 encoded strings used in `LANG=C sort`
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
	static compareSortKeys(dataType, a, b)
	{
		if (dataType === DataType.NUMBER) {
			return Collator._compareNumbers(+a, +b);
		}

		return Collator._compareSortAsJson(dataType, a, b);
	}

	/**
	 *
	 * @param {string} dataType
	 * @param {mixed} value
	 * @returns {string}
	 */
	static generateGroupKey(dataType, value)
	{
		if (dataType === DataType.NUMBER) {
			return NumberUtils.toDecString(value) + '';
		} else if (dataType === DataType.STRING) {
			return Collator._generateGroupKeyString(value);
		} else {
			return Collator._generateKeyMixed(value);
		}
	}

	static generateSortKey(dataType, value)
	{
		if (dataType === DataType.NUMBER) {
			return NumberUtils.toDecString(value) + '';
		} else if (dataType === DataType.STRING) {
			return Collator._generateSortKeyString(value);
		} else {
			return Collator._generateKeyMixed(value);
		}
	}

	static _generateSortKeyString(value)
	{
		const s = STRING.prototype.call([value]);

		return s;
	}

	static _generateGroupKeyString(value)
	{
		/* eslint-disable indent, no-unreachable */
		switch (typeof(value)) {
			case 'string':
				return JSON.stringify(value);
			break;
			case 'number':
				return '"' + NumberUtils.toDecString(value) + '"';
			break;
			case 'boolean':
				return value ? '"true"' : '"false"';
			break;
			case 'undefined':
				return '""';
			break;
			default:
				if (value === null) {
					return '"null"';
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
				return '5_' + NumberUtils.toDecString(value) + '';
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
