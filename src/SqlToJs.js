'use strict';

const AggregationFunction = require('./AggregationFunction');
const SqlToJsHelpers = require('./SqlToJsHelpers');
const RegexpUtils = require('./RegexpUtils');
const RuntimeContext = require('./RuntimeContext');
const FunctionsMap = require('./FunctionsMap');

const ProgramError = require('./error/ProgramError');

class SqlToJs
{
	/**
	 *
	 * @param {FunctionsMap} functionsMap
	 * @param {RuntimeContext} runtimeContext
	 * @returns {SqlToJs}
	 */
	constructor(functionsMap = new FunctionsMap, runtimeContext = new RuntimeContext(new FunctionsMap))
	{
		this.runtimeContext = runtimeContext;
		this.functionsMap = functionsMap;

		this.basicFunctionsPropertyName = 'this.' + this.runtimeContext.basicFunctionsPropertyName;
		this.aggregationPropertyName = 'this.' + this.runtimeContext.aggregationsPropertyName;

		this.rowArgumentName = 'row';

		/* TODO config */
		this.rowVarName = 'row.sources';
		this.aggregationCacheVarName = 'row.aggregationCache';

		this.helpers = new SqlToJsHelpers;
	}

	/**
	 *
	 * @param {Node} node
	 * @returns {string}
	 */
	nodeToCode(node)
	{
		const nodeType = node.type();

		const codeConstructorName = 'codeFrom_' + nodeType;

		if (!(codeConstructorName in this)) {
			throw new ProgramError('Unknown node type: ' + nodeType);
		}

		return this[codeConstructorName](node);
	}

	/**
	 *
	 * @param {Node} node
	 * @returns {Function}
	 */
	nodeToFunction(node)
	{
		return (new Function(
			['_helpers', this.rowArgumentName],
			'return ' + this.nodeToCode(node)
		)).bind(this.runtimeContext, this.helpers);
	}

	/**
	 *
	 * @param {mixed} basic
	 * @returns {string}
	 */
	basicTypeToCode(basic)
	{
		return JSON.stringify(basic);
	}

	codeFrom_ColumnIdent(columnIdent)
	{
		/*
		 * SQL: `a`.`b`.`c`
		 * JS: ((item.a || undefined) && (item.a.b || undefined) && item.a.b.c)
		 */
		if (columnIdent.expandedAlias) {
			return this.nodeToCode(columnIdent.expandedAlias);
		}

		var levels = [];
		var rel = this.rowVarName;
		const frags = columnIdent.getFragments();

		for (let i = 0; i < frags.length - 1; i++) {
			const fragment = frags[i];

			rel += '[' + JSON.stringify(fragment) + ']';
			levels.push('(' + rel + ' || undefined)');
		}

		levels.push(rel + '[' + JSON.stringify(frags[frags.length - 1]) + ']');

		if (levels.length > 1) {
			return '(' + levels.join(' && ') + ')';
		} else {
			return levels[0];
		}

	}

	codeFrom_FunctionIdent(functionIdent)
	{
		return (
			this.basicFunctionsPropertyName + '['
			+ functionIdent.getFragments()
				.map(s => s.toUpperCase())
				.map(JSON.stringify)
				.join('][')
			+ ']'
		);
	}

	codeFrom_Call(call)
	{
		const func = this.functionsMap.get(call.function.getFragments());

		if (func && func.prototype instanceof AggregationFunction) {
			/*
			 * Результат агрегирующей функции берётс из закешированного значения,
			 * а кеш генерится в Aggregation
			 */
			const nodeKey = JSON.stringify(call.id);

			const code = this.aggregationCacheVarName + '[' + nodeKey + ']';

			return code;
		}

		return (
			this.codeFrom_FunctionIdent(call.function)
			+ '(['
			+ this.nodeToCode(call.args)
			+ '])'
		);
	}

	codeFrom_String(string)
	{
		return this.basicTypeToCode(string.value);
	}

	codeFrom_Boolean(boolean)
	{
		return this.basicTypeToCode(boolean.value);
	}

	codeFrom_Number(number)
	{
		return this.basicTypeToCode(number.value);
	}

	codeFrom_Null(n)
	{
		return this.basicTypeToCode(null);
	}

	codeFrom_Brackets(brackets)
	{
		return '(' + this.nodeToCode(brackets.expression) + ')';
	}

	codeFrom_UnaryOperation(unary)
	{
		return unary.operator + '(' + this.nodeToCode(unary.right) + ')';
	}

	codeFrom_UnaryLogicalOperation(unary)
	{
		return this.codeFrom_UnaryOperation(unary);
	}

	codeFrom_UnaryArithmeticOperation(unary)
	{
		return this.codeFrom_UnaryOperation(unary);
	}

	codeFrom_BinaryOperation(binary)
	{
		if (binary.right.deepType() === 'Interval') {
			return this.codeFrom_BinaryOperator_interval(binary);
		}

		const left = this.nodeToCode(binary.left);
		const right = this.nodeToCode(binary.right);

		if (binary.operator === '+') {
			return `((${left}) - 0) ${binary.operator} ((${right}) - 0)`;
		}

		return `${left} ${binary.operator} ${right}`;
	}

	codeFrom_BinaryOperator_interval(binary)
	{
		const intervalBase = binary.left;
		const interval = binary.right;
		let line = this.nodeToCode(intervalBase);

		for (const delta of interval.deltas) {
			let deltaSize = this.nodeToCode(delta.expression);

			if (binary.operator === '-') {
				deltaSize = '-(' + deltaSize + ')';
			}

			line = '_helpers.date.moveOnInterval('
				+ line
				+ ', ' + JSON.stringify(delta.unit)
				+ ', ' + deltaSize
			+ ')';
		}

		return line;
	}

	codeFrom_BinaryArithmeticOperation(binary)
	{
		return this.codeFrom_BinaryOperation(binary);
	}

	codeFrom_IntervalOperation(oper)
	{
		return this.codeFrom_BinaryOperation(oper);
	}

	codeFrom_ComparisonOperation(comp)
	{
		var op = comp.operator === '=' ? '==' : comp.operator;

		var leftCode = this.nodeToCode(comp.left);
		var rightCode = this.nodeToCode(comp.right);

		var isDates = false;

		if (comp.left.deepType() === 'IntervalOperation') {
			rightCode = '_helpers.date.toDate(' + rightCode + ')';

			isDates = true;
		}

		if (comp.right.deepType() === 'IntervalOperation') {
			leftCode = '_helpers.date.toDate(' + leftCode + ')';

			isDates = true;
		}

		if (isDates) {
			rightCode = '(' + rightCode + ').getTime()';
			leftCode = '(' + leftCode + ').getTime()';
		}

		return leftCode + ' ' + op + ' ' + rightCode;
	}

	codeFrom_LogicalOperation(comp)
	{
		var operatorsMapping = {
			and: '&&',
			or: '||'
		};

		const operator = operatorsMapping[comp.operator.toLowerCase()] || comp.operator;

		return '!!(' + this.nodeToCode(comp.left) + ' ' + operator + ' ' + this.nodeToCode(comp.right) + ')';
	}

	codeFrom_ExpressionsList(expressionsList)
	{
		return expressionsList.values.map(this.nodeToCode.bind(this)).join(', ');
	}

	codeFrom_BindingValueScalar(binded)
	{
		return this.nodeToCode(binded.ast);
	}

	codeFrom_BindingValueList(binded)
	{
		return this.nodeToCode(binded.ast);
	}

	codeFrom_UnstrictIn(exp)
	{
		return '_helpers.operators.unstrictIn([' + this.nodeToCode(exp.haystack) + '], ' + this.nodeToCode(exp.needle) + ')';
	}

	codeFrom_StrictIn(exp)
	{
		return '[' + this.nodeToCode(exp.haystack) + '].includes(' + this.nodeToCode(exp.needle) + ')';
	}

	codeFrom_Map(exp)
	{
		const itemsCode = [];

		for (const k in exp.map) {
			itemsCode.push(JSON.stringify(k) + ': ' + this.nodeToCode(exp.map[k]));
		}

		return '{' + itemsCode.join(', ') + '}';
	}

	codeFrom_Array(exp)
	{
		const itemsCode = [];

		for (const item of exp.items) {
			itemsCode.push(this.nodeToCode(item));
		}

		return '[' + itemsCode.join(', ') + ']';
	}

	/**
	 *
	 * @param {LikeOpearion} exp
	 * @returns {string}
	 */
	codeFrom_LikeOperation(exp)
	{
		if (exp.right.deepType() === 'String') {
			// pattern - constant string. Can be compiled once

			const regex = this.helpers.operators.likeCompileRegexString(exp.right.value, exp.caseSensitive);

			return '(' + regex + '.test(' + this.nodeToCode(exp.left).toString() + '))';
		} else {
			return (
				'_helpers.operators.like('
					+ '"" + ' + this.nodeToCode(exp.right)
					+ ', ' + (exp.caseSensitive ? 'true' : 'false')
					+ ', ' + this.nodeToCode(exp.left)
				+ ')'
			);
		}
	}

	/**
	 *
	 * @param {RegexpOperation} exp
	 * @returns {string}
	 */
	codeFrom_RegexpOperation(exp)
	{
		if (exp.right.deepType() === 'String') {
			const r = RegexpUtils.parseRegexp(exp.right.value).regexp;

			const regexpString = '/' + r.source + '/' + r.flags;

			return '(' + regexpString + '.test(' + this.nodeToCode(exp.left) + ' + ""))';
		} else {
			return (
				'_helpers.operators.regexp('
					+ this.nodeToCode(exp.right) + ' + ""'
					+ ', ' + this.nodeToCode(exp.left) + ' + ""'
				+ ')'
			);
		}
	}

	/**
	 *
	 * @param {BetweenOperation} exp
	 * @returns {string}
	 */
	codeFrom_BetweenOperation(exp)
	{
		return (
			'_helpers.operators.between('
				+ this.nodeToCode(exp.left)
				+ ', ' + this.nodeToCode(exp.rangeStart)
				+ ', ' + this.nodeToCode(exp.rangeEnd)
			+ ')'
		);
	}

	/**
	 *
	 * @param {IsOperation} exp
	 * @returns {string}
	 */
	codeFrom_IsOperation(exp)
	{
		return (
			'_helpers.operators.is('
				+ this.nodeToCode(exp.left)
				+ ', ' + JSON.stringify(exp.expected)
			+ ')'
		);
	}
}

module.exports = SqlToJs;
