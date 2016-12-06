'use strict';

const assert = require('assert');
const ComplexIdent = require('../../../../src/sql/nodes/ComplexIdent');
const BindingIdent = require('../../../../src/sql/nodes/BindingIdent');
const BindingIdentList = require('../../../../src/sql/nodes/BindingIdentList');
const Ident = require('../../../../src/sql/nodes/Ident');
const ProgramError = require('../../../../src/error/ProgramError');

describe('sql/nodes/Ident', () => {
	describe('escaping', () => {
		const input = [
			'`quotes`',
			'no quotes',
			new Ident('`quote\\`s`'),
			new Ident('no quotes'),
			new BindingIdent('[:ident]'),
			new BindingIdentList('[::identList]')
		];

		const output = [
			'quotes',
			'no quotes',
			'quote`s',
			'no quotes',
			input[4],
			input[5]
		];

		it('constructor', () => {
			const complexIdent = new ComplexIdent(input);

			assert.deepStrictEqual(complexIdent.fragments, output);
		});

		it('add()', () => {
			const complexIdent = new ComplexIdent([]);

			for (const f of input) {
				complexIdent.addFragment(f);
			}

			assert.deepStrictEqual(complexIdent.fragments, output);
		});
	});

	describe('binding', () => {
		const bind = new BindingIdent('[:test]');
		const bindList = new BindingIdentList('[::testList]');
		const bind2 = new BindingIdent('[:test2]');
		const complexIdent = new ComplexIdent([bind, bindList, bind2]);

		it('not binded', () => {
			assert.throws(
				() => {
					complexIdent.getFragments();
				},
				ProgramError
			);
		});

		it('binded', () => {
			bind.expand('hello');
			bindList.expand(['one', 'two']);
			bind2.expand('hello2');

			assert.deepStrictEqual(complexIdent.getFragments(), ['hello', 'one', 'two', 'hello2']);
		});
	});
});
