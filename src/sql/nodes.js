var util = require('util');

function InspectableNode() {
};

InspectableNode.prototype.getNodeType = function() {
	return this.constructor.name;
};

InspectableNode.prototype.inspect = function(depth, opts) {
	var obj = {};

	for(var k in this) {
		if(this.hasOwnProperty(k))
			obj[k] = this[k];
	}

	var type = this.getNodeType();

	if(opts && opts.colors) {
		var color = util.inspect.colors[util.inspect.styles.special][0];

		type = '\x1b[' + color + 'm' + type + '\x1b[0m';
	}

	return type + ' ' + util.inspect(obj, opts);
};

function Number(number) {
	this.value = number - 0;
};

util.inherits(Number, InspectableNode);

exports.Number = Number;

function Boolean(value) {
	this.value = !!value;
};

util.inherits(Boolean, InspectableNode);

exports.Boolean = Boolean;

function String(string) {
	this.value = string.substr(1, string.length - 2);
};

util.inherits(String, InspectableNode);

exports.String = String;

function Null() {
	this.value = null;
};

util.inherits(Null, InspectableNode);

exports.Null = Null;

function Ident(name) {
	if(name[0] === '`')
		name = name.substr(1, name.length - 2);

	this.name = name;
};

util.inherits(Ident, InspectableNode);

exports.Ident = Ident;

function ComplexIdent(ident) {
	this.fragments = [ident];
};

util.inherits(ComplexIdent, InspectableNode);

exports.ComplexIdent = ComplexIdent;

function Call(functionIdent, args) {
	this.function = functionIdent;
	this.args = args;
};

util.inherits(Call, InspectableNode);

exports.Call = Call;

function BinaryOperation(operator, left, right) {
	this.operator = operator;
	this.left = left;
	this.right = right;
};

util.inherits(BinaryOperation, InspectableNode);

exports.BinaryOperation = BinaryOperation;

function ComparsionOperation(operator, left, right) {
	this.operator = operator;
	this.left = left;
	this.right = right;
};

util.inherits(ComparsionOperation, InspectableNode);

exports.ComparsionOperation = ComparsionOperation;

function UnaryOperation(operator, right) {
	this.operator = operator;
	this.right = right;
};

util.inherits(UnaryOperation, InspectableNode);

exports.UnaryOperation = UnaryOperation;

function In(needle, haystack) {
	this.needle = needle
	this.haystack = haystack;
};

util.inherits(In, InspectableNode);

exports.In = In;

function Column(expression, alias) {
	this.alias = alias || null;
	this.expression = expression;
};

util.inherits(Column, InspectableNode);

exports.Column = Column;

function Order(expression, direction, collation) {
	this.expression = expression;
	this.direction = direction || null;
	this.collation = collation || null;
};

util.inherits(Order, InspectableNode);

exports.Order = Order;

function Distinct(expression) {
	this.expression = expression;
};

util.inherits(Distinct, InspectableNode);

exports.Distinct = Distinct;

function Select() {
	this.columns = [];
	this.table = null;
	this.joins = [];
	this.where = null;
	this.groups = [];
	this.having = null;
	this.orders = [];
	this.limit = null;
};

util.inherits(Select, InspectableNode);

Select.prototype.join = function(join) {
	this.joins.push(join);
};

Select.prototype.setLimit = function(count, offset) {
	this.limit = new Limit(count, offset);
}

Select.prototype.groupBy = function(expressions) {
	this.groups = expressions;
};

Select.prototype.orderBy = function(orders) {
	this.orders = orders;
};

exports.Select = Select;

function InnerJoin(table, expression) {
	this.table = table;
	this.expression = expression;
};

util.inherits(InnerJoin, InspectableNode);

exports.InnerJoin = InnerJoin;

function LeftJoin(table, expression) {
	this.table = table;
	this.expression = expression;
};

util.inherits(LeftJoin, InspectableNode);

exports.LeftJoin = LeftJoin;

function Brackets(expression) {
	this.expression = expression;
};

util.inherits(Brackets, InspectableNode);

exports.Brackets = Brackets;


function ColumnIdent(complexIdent) {
	this.fragments = complexIdent.fragments;
}

util.inherits(ColumnIdent, InspectableNode);

exports.ColumnIdent = ColumnIdent;


function ColumnAlias(ident) {
	this.name = ident.name;
}

util.inherits(ColumnAlias, InspectableNode);

exports.ColumnAlias = ColumnAlias;


function Table(tableIdent, tableAlias) {
	this.alias = tableAlias || null;
	this.ident = tableIdent;
}

util.inherits(Table, InspectableNode);

exports.Table = Table;


function TableAlias(ident) {
	this.name = ident.name;
}

util.inherits(TableAlias, InspectableNode);

exports.TableAlias = TableAlias;


function FunctionIdent(complexIdent) {
	this.fragments = complexIdent.fragments;
}

util.inherits(FunctionIdent, InspectableNode);

exports.FunctionIdent = FunctionIdent;


function TableIdent(complexIdent) {
	this.fragments = complexIdent.fragments;
}

util.inherits(TableIdent, InspectableNode);

exports.TableIdent = TableIdent;

function Limit(count, offset) {
	this.count = count === undefined ? null : count;
	this.offset = offset === undefined ? null : offset;
}

util.inherits(Limit, InspectableNode);

exports.Limit = Limit;
