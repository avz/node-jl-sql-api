'use strict';

const JlSql = require('../../..');
const assert = require('assert');

describe('SELECT keywords', () => {
	const jlSql = new JlSql({forceInMemory: true});

	it('possible to use in field names', (done) => {
		var keywords = [
			'SELECT',
			'DELETE',
			'INSERT',
			'UPDATE',
			'SET',
			'FROM',
			'STRICT',
			'IN',
			'AND',
			'OR',
			'WHERE',
			'ORDER',
			'GROUP',
			'BY',
			'HAVING',
			'LIMIT',
			'OFFSET',
			'ASC',
			'DESC',
			'JOIN',
			'LEFT',
			'INNER',
			'INTERVAL',
			'YEAR',
			'MONTH',
			'DAY',
			'HOUR',
			'MINUTE',
			'SECOND'
		];

		const query = 'SELECT ' + keywords.join(', ');

		jlSql.query(query)
			.fromArrayOfObjects([])
			.toArrayOfObjects((r) => {
				assert.ok(true);

				done();
			})
		;

	});
});
