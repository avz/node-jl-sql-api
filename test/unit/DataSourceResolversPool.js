'use strict';

const assert = require('assert');
const DataSourceResolversPool = require('../../src/DataSourceResolversPool');
const DataSourceResolver = require('../../src/DataSourceResolver');

describe('DataSourceResolversPool', () => {
	const Resolver = class extends DataSourceResolver
	{
		constructor(prefix)
		{
			super();
			this.prefix = prefix;
		}

		resolve(path)
		{
			if (path[0] !== this.prefix) {
				return null;
			}

			const p = path.slice(1);

			return {
				outputType: true,
				ident: this.prefix + '::path::' + p.join('/')
			};
		}

		extractAlias(path)
		{
			if (path[0] !== this.prefix) {
				return null;
			}

			const p = path.slice(1);

			return this.prefix + '::alias::' + p.join('/');
		}
	};

	const resolver1 = new Resolver('first');
	const resolver2 = new Resolver('second');
	const resolver3 = new Resolver('third');

	describe('resolve()', () => {
		const pool = new DataSourceResolversPool;

		pool.add(resolver1);
		pool.add(resolver2);
		pool.add(resolver3);

		it('found', () => {
			assert.strictEqual(pool.resolve(['first', 'hello']).stream.ident, 'first::path::hello');
			assert.strictEqual(pool.resolve(['second', 'hello']).stream.ident, 'second::path::hello');
			assert.strictEqual(pool.resolve(['third', 'hello']).stream.ident, 'third::path::hello');
		});

		it('not found', () => {
			assert.strictEqual(pool.resolve(['none']), null);
		});
	});

	describe('extractAlias()', () => {
		const pool = new DataSourceResolversPool;

		pool.add(resolver1);
		pool.add(resolver2);
		pool.add(resolver3);

		it('found', () => {
			assert.strictEqual(pool.extractAlias(['first', 'hello']), 'first::alias::hello');
			assert.strictEqual(pool.extractAlias(['second', 'hello']), 'second::alias::hello');
			assert.strictEqual(pool.extractAlias(['third', 'hello']), 'third::alias::hello');
		});

		it('not found', () => {
			assert.strictEqual(pool.extractAlias(['none']), null);
		});
	});
});
