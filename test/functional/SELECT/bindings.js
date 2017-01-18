'use strict';

const JlSql = require('../../..');
const assert = require('assert');

describe('SELECT', () => {
	const jlSql = new JlSql({forceInMemory: true});

	describe('Data Bindings', () => {
		const input = [{r: true}, {r: false}];

		let output;

		before(done => {
			jlSql.query(
					'SELECT IF(r, :trueString, :falseString) AS scalarString'
					+ ', IF(r, :true, :false) AS scalarBool'
					+ ', IF(::ifTrue) AS ifTrue'
					+ ', IF(::ifFalse) AS ifFalse'
					+ ', IF(true, ::ifCombTrue) AS ifCombTrue'
					+ ', IF(false, ::ifCombFalse) AS ifCombFalse'
					+ ', IF(::ifCombComb, true, false) AS ifCombComb'
				)
				.bind(':trueString', '-TRUE-')
				.bind(':falseString', '-FALSE-')
				.bind(':true', true)
				.bind(':false', false)
				.bind('::ifTrue', [true, '-TRUE-', false])
				.bind('::ifFalse', [false, '-TRUE-', false])
				.bind('::ifCombTrue', [true, false])
				.bind('::ifCombFalse', [true, false])
				.bind('::ifCombComb', [true])
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					output = r;
					done();
				})
			;
		});

		it('scalar', () => {
			assert.strictEqual(output[0].scalarString, '-TRUE-');
			assert.strictEqual(output[1].scalarString, '-FALSE-');
			assert.strictEqual(output[0].scalarBool, true);
			assert.strictEqual(output[1].scalarBool, false);
		});

		it('list', () => {
			assert.strictEqual(output[0].ifTrue, '-TRUE-');
			assert.strictEqual(output[0].ifFalse, false);
		});

		it('combined list', () => {
			assert.strictEqual(output[0].ifCombTrue, true);
			assert.strictEqual(output[0].ifCombFalse, false);
			assert.strictEqual(output[0].ifCombComb, true);
		});
	});

	describe('Identifier Bindings', () => {
		const input = [{a: {aa: {aaa: 'A.AA.AAA'}, ab: 'A.AB'}, b: 'B'}];

		let output;

		before(done => {
			jlSql.query(
					'SELECT {:a}.{::aa_aaa} AS a_aa_aaa1'
					+ ', {:a}.{:aa}.{:aaa} AS a_aa_aaa2'
					+ ', {::a_aa}.{:aaa} AS a_aa_aaa3'
					+ ', {::a_aa_aaa} AS a_aa_aaa4'
					+ ', {::bm} AS b1'
					+ ', {:b} AS b2'
					+ ', {:b}'
					+ ', {::a_aa_aaa}'
					+ ', {::a_aa}.{:aaa}'
				)
				.bind(':a', 'a')
				.bind(':aa', 'aa')
				.bind(':aaa', 'aaa')
				.bind(':b', 'b')
				.bind('::bm', ['b'])
				.bind('::a_aa', ['a', 'aa'])
				.bind('::aa_aaa', ['aa', 'aaa'])
				.bind('::a_aa_aaa', ['a', 'aa', 'aaa'])
				.fromArrayOfObjects(input)
				.toArrayOfObjects((r) => {
					output = r;
					done();
				})
			;
		});

		it('single ident', () => {
			assert.strictEqual(output[0].b2, 'B');
			assert.strictEqual(output[0]['{:b}'], 'B');
		});

		it('multi ident', () => {
			assert.strictEqual(output[0].a_aa_aaa4, 'A.AA.AAA');
			assert.strictEqual(output[0].b2, 'B');
			assert.strictEqual(output[0]['{::a_aa_aaa}'], 'A.AA.AAA');
		});

		it('mixed ident', () => {
			assert.strictEqual(output[0].a_aa_aaa1, 'A.AA.AAA');
			assert.strictEqual(output[0].a_aa_aaa2, 'A.AA.AAA');
			assert.strictEqual(output[0].a_aa_aaa3, 'A.AA.AAA');
			assert.strictEqual(output[0]['{::a_aa}.{:aaa}'], 'A.AA.AAA');
		});
	});
});
