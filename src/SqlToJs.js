'use strict';

const AggregationFunction = require('./AggregationFunction');

const ProgramError = require('./error/ProgramError');

class SqlToJs
{
	constructor(functionsMap, runtimeContext)
	{
		this.runtimeContext = runtimeContext;
		this.functionsMap = functionsMap;

		this.basicFunctionsPropertyName = 'this.' + this.runtimeContext.basicFunctionsPropertyName;
		this.aggregationPropertyName = 'this.' + this.runtimeContext.aggregationsPropertyName;

		this.rowArgumentName = 'row';

		/* TODO config */
		this.rowVarName = 'row.sources';
		this.aggregationCacheVarName = 'row.aggregationCache';
	}

	nodeToCode(node)
	{
		const nodeType = node.type();

		const codeConstructorName = 'codeFrom_' + nodeType;

		if (!(codeConstructorName in this)) {
			throw new ProgramError('Unknown node type: ' + nodeType);
		}

		return this[codeConstructorName](node);
	}

	nodeToFunction(node)
	{
		return (new Function(
			[this.rowArgumentName],
			'return ' + this.nodeToCode(node)
		)).bind(this.runtimeContext);
	}

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
		var levels = [];
		var rel = this.rowVarName;
		const frags = columnIdent.fragments;

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
			+ functionIdent.fragments
				.map(s => s.toUpperCase())
				.map(JSON.stringify)
				.join('][')
			+ ']'
		);
	}

	codeFrom_Call(call)
	{
		const func = this.functionsMap.get(call.function.fragments);

		if (func && func.prototype instanceof AggregationFunction) {
			/*
			 * Агрегирующие функции хранят состояние, поэтому вызов должен
			 * быть привязан к определённому контексту.
			 * Контекст определяется по уникальному идентификатору ноды.
			 * Конкретно этот код используется только для генерации результата агрегации,
			 * а обновления, инициализация и очистка происходят в группировщике
			 */
			const nodeKey = JSON.stringify(call.id);

			const code = ('' +
				'( ' + nodeKey + ' in ' + this.aggregationCacheVarName
					+ ' ? ' + this.aggregationCacheVarName + '[' + nodeKey + ']'
					+ ' : ('
						+ this.aggregationPropertyName + '[' + nodeKey + ']'
						+ '('
							+ this.nodeToCode(call.args)
						+ ')'
					+ ')'
				+ ')'
			);

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
		return unary.operator + this.nodeToCode(unary.right);
	}

	codeFrom_UnaryLogicalOperation(unary)
	{
		return this.codeFrom_UnaryOperation(unary);
	}

	codeFrom_UnaryArithmeticalOperation(unary)
	{
		return this.codeFrom_UnaryOperation(unary);
	}

	codeFrom_BinaryOperation(binary)
	{
		const left = this.nodeToCode(binary.left);
		const right = this.nodeToCode(binary.right);

		if (binary.operator === '+') {
			return `((${left}) - 0) ${binary.operator} ((${right}) - 0)`;
		}

		return `${left} ${binary.operator} ${right}`;
	}

	codeFrom_BinaryArithmeticOperation(binary)
	{
		return this.codeFrom_BinaryOperation(binary);
	}

	codeFrom_ComparsionOperation(comp)
	{
		const op = comp.operator === '=' ? '==' : comp.operator;

		return this.nodeToCode(comp.left) + ' ' + op + ' ' + this.nodeToCode(comp.right);
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
}

module.exports = SqlToJs;
