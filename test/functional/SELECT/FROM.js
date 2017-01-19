'use strict';

const JlSql = require('../../..');
const DataSourceResolver = require('../../..').DataSourceResolver;
const assert = require('assert');
const PassThrough = require('stream').PassThrough;

describe('SELECT', () => {
	const jlSql = new JlSql({
		forceInMemory: true,
		dataSourceResolvers: [
			new class extends DataSourceResolver {
				resolve(location)
				{
					assert.deepStrictEqual(location, ['input.json']);

					const p = new PassThrough();

					p.write(JSON.stringify({hello: 'world'}) + '\n');
					p.write(JSON.stringify({hello: 'hello'}) + '\n');

					p.end();

					return p;
				}
			}
		]
	});

	describe('`SELECT ... FROM`', () => {

		let output;

		before(done => {
			jlSql.query('SELECT * FROM `input.json`')
				.fromEmptyStream()
				.toArrayOfObjects((r) => {
					output = r;
					done();
				})
			;
		});

		it('valid data', () => {
			assert.deepStrictEqual(output, [{hello: 'world'}, {hello: 'hello'}]);
		});
	});
});
