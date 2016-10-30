class SqlToJs
{
	constructor()
	{
		this.functionsObjectName = 'sqlFunctions';
		this.rowObjectName = 'item';
	}

	nodeToCode(node)
	{
		var nodeType = node.getNodeType();

		var codeConstructorName = 'codeFrom_' + nodeType;

		if (!(codeConstructorName in this)) {
			throw new Error('Unknown node type: ' + nodeType);
		}

		return this[codeConstructorName](node);
	}

	/**
	 * @param {String} objectName
	 * @param {String[]} path
	 * @returns {String}
	 */
	objectPathToCode(objectName, path)
	{
		return objectName + '[' + path.map(JSON.stringify).join('][') + ']';
	}

	basicTypeToCode(basic)
	{
		return JSON.stringify(basic);
	}

	codeFrom_ColumnIdent(columnIdent)
	{
		return this.objectPathToCode(this.rowObjectName, columnIdent.fragments);
	}

	codeFrom_FunctionIdent(functionIdent)
	{
		return this.objectPathToCode(this.functionsObjectName, functionIdent.fragments);
	}

	codeFrom_Call(call)
	{
		return (
			this.codeFrom_FunctionIdent(call.function)
			+ '('
			+ call.args.map(this.nodeToCode.bind(this)).join(', ')
			+ ')'
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

	codeFrom_BinaryOperation(binary)
	{
		return this.nodeToCode(binary.left) + ' ' + binary.operator + ' ' + this.nodeToCode(binary.right);
	}

	codeFrom_ComparsionOperation(comp)
	{
		return this.nodeToCode(comp.left) + ' ' + comp.operator + ' ' + this.nodeToCode(comp.right);
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
}

module.exports = SqlToJs;
