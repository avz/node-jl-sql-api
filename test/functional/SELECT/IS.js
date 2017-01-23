'use strict';

const JlSql = require('../../..');
const assert = require('assert');

describe('SELECT', () => {
	const jlSql = new JlSql({forceInMemory: true});

	describe('IS', () => {
		const types = [
			'array',
			'object',
			'string',
			'number',
			'bool',
			'boolean',
			'null'
		];

		const sql = 'SELECT ' + types.map(t => 'v IS ' + t + ' AS is_' + t).join(', ');

		const cases = {
			'[]': 'array',
			'["1"]': 'array',
			'{}': 'object',
			'{"a": "b"}': 'object',
			'"hello"': 'string',
			'""': 'string',
			'10': 'number',
			'0.123': 'number',
			'true': 'bool',
			'false': 'bool',
			'null': 'null'
		};

		for (const value in cases) {
			const type = cases[value];

			it(type, (done) => {
				jlSql.query(sql)
					.fromArrayOfObjects([{v: JSON.parse(value)}])
					.toArrayOfObjects((r) => {
						const row = r[0];

						for (const f in row) {
							if (f === 'is_' + type || (type === 'bool' && f === 'is_boolean')) {
								assert.strictEqual(row[f], true);
							} else {
								assert.strictEqual(row[f], false);
							}
						}

						done();
					})
				;
			});
		}
	});
});
