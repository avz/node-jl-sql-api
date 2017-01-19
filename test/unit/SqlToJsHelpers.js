'use strict';

const assert = require('assert');
const SqlToJsHelpers = require('../../src/SqlToJsHelpers');
const SqlToJsOperatorsHelper = require('../../src/SqlToJsOperatorsHelper');
const SqlToJsDateHelper = require('../../src/SqlToJsDateHelper');

describe('SqlToJsHelpers', () => {
	const helpers = new SqlToJsHelpers(null);

	it('operators', () => {
		assert.ok(helpers.operators instanceof SqlToJsOperatorsHelper);
	});

	it('date', () => {
		assert.ok(helpers.date instanceof SqlToJsDateHelper);
	});
});
