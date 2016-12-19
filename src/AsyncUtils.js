'use strict';

/**
 * Выполняет eachCb(item, nextCb) для каждого элемента массива array.
 * Если nextCb() был вызван синхронно, то следующий элемент будет обработан
 * синхронно сразу после окончания выполнения коллбека.
 *
 * @param {Array} array
 * @param {Function} eachCb
 * @param {Function} endCb
 * @param {Object} options
 * @returns {undefined}
 */
exports.eachSeriesHalfSync = (array, eachCb, endCb = null) => {
	let cbWasCalled = false;
	let asyncExpected = false;
	let offset = 0;

	/* eslint-disable no-use-before-define */
	// eslint ругается на использование next перед инициализацией
	const nextCb = () => {
		cbWasCalled = true;

		if (asyncExpected) {
			next();
		}
	};
	/* eslint-enable no-use-before-define */

	const next = () => {
		while (offset < array.length) {
			const elt = array[offset];

			offset++;

			cbWasCalled = false;
			asyncExpected = false;

			eachCb(elt, nextCb);

			if (!cbWasCalled) {
				asyncExpected = true;

				// callback is async, waiting for nextCb() call

				return;
			}
		}

		if (endCb) {
			endCb();
		}
	};

	next();
};
