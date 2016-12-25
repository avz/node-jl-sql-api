'use strict';

class NumberUtils
{
	/**
	 * Сгенерировать десятичную строку без E-нотации
	 * @param {number} number
	 * @returns {string}
	 */
	static toDecString(number)
	{
		const s = number + '';

		/*
		 * @see http://www.ecma-international.org/ecma-262/5.1/#sec-9.8.1
		 */

		if (number === 0 || (number >= 1e-6 && number <= 1e20)) {
			return s;
		}

		if (s === 'NaN' || s[0] === 'I' || s[1] === 'I') { // 'I' - /-?Infinity/
			return s;
		}

		return NumberUtils.exponentialStringToDec(s);
	}

	static exponentialStringToDec(string)
	{
		const m = string.match(/^(-|)(?:([0-9]*)(?:\.([0-9]+))?)[eE]([-+]?[0-9]+)/);

		if (!m) {
			return string;
		}

		const [, sign, int, float, exp] = m;

		if (int.length !== 1 || int[0] === '0') {
			// v8 не генерит такого сам
			throw new Error('not supported');
		}

		const dotPosition = (+exp) + 1;
		const digits = int + (float === undefined ? '' : float);

		if (dotPosition >= digits.length) {
			return sign + digits + '0'.repeat(dotPosition - digits.length);
		} else if (dotPosition < 0) {
			return sign + '0.' + '0'.repeat(-dotPosition) + digits;
		} else if (dotPosition === 0) {
			return sign + '0.' + digits;
		} else {
			return sign + digits.substr(0, dotPosition) + '.' + digits.substr(dotPosition);
		}
	}
}

module.exports = NumberUtils;
