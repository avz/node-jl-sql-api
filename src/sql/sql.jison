%{
const Nodes = require('./Nodes.js');
const JL_JISON_INPUT_SYMBOL = Symbol('JL_JISON_INPUT_SYMBOL');
%}

/* lexical grammar */
%lex

%{
if (!(JL_JISON_INPUT_SYMBOL in yy.lexer)) {
	yy.lexer[JL_JISON_INPUT_SYMBOL] = this.matches.input;
}
%}

%options case-insensitive ranges backtrack_lexer

%%
\s+	{}

"SELECT"	{ return 'SELECT'; }
"DELETE"	{ return 'DELETE'; }
"INSERT"	{ return 'INSERT'; }
"VALUES"	{ return 'VALUES'; }
"UPDATE"	{ return 'UPDATE'; }

","      { return ','; }

"NULL"   { return 'NULL'; }
"TRUE"   { return 'TRUE'; }
"FALSE"  { return 'FALSE'; }

"IS"  { return 'IS_KEYWORD'; }

"STRING"  { return 'STRING_KEYWORD'; }
"NUMBER"  { return 'NUMBER_KEYWORD'; }
"BOOL"    { return 'BOOL_KEYWORD'; }
"BOOLEAN" { return 'BOOL_KEYWORD'; }
"OBJECT"  { return 'OBJECT_KEYWORD'; }
"ARRAY"   { return 'ARRAY_KEYWORD'; }

"NOT" { return 'NOT'; }

"FROM"	{ return 'FROM'; }
"DISTINCT"	{ return 'DISTINCT'; }
"NUMERIC"	{ return 'NUMERIC'; }
"WHERE"	{ return 'WHERE'; }
"ORDER"	{ return 'ORDER'; }
"GROUP"	{ return 'GROUP'; }
"BY"	{ return 'BY'; }
"HAVING"	{ return 'HAVING'; }
"COUNT"	{ return 'COUNT'; }
"LIMIT"	{ return 'LIMIT'; }
"OFFSET"	{ return 'OFFSET'; }
"LEFT"	{ return 'LEFT'; }
"INNER"	{ return 'INNER'; }
"SET"	{ return 'SET'; }

"INTERVAL"	{ return 'INTERVAL'; }
"YEAR" { return 'YEAR'; }
"MONTH" { return 'MONTH'; }
"DAY" { return 'DAY'; }
"HOUR" { return 'HOUR'; }
"MINUTE" { return 'MINUTE'; }
"SECOND" { return 'SECOND'; }

"LIKE" { return 'LIKE'; }
"ILIKE" { return 'ILIKE'; }
"REGEXP" { return 'REGEXP'; }

"BETWEEN" { return 'BETWEEN'; }

\"(\\.|[^\\"])*\"	{ return 'STRING'; }
\'(\\.|[^\\'])*\'	{ return 'STRING'; }
[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)? { return 'NUMBER'; }
\:[a-z_][a-z0-9_]*	{ return 'BINDING_VALUE_SCALAR'; }
\:\:[a-z_][a-z0-9_]*	{ return 'BINDING_VALUE_LIST'; }
\{\:[a-z_][a-z0-9_]*\}	{ return 'BINDING_IDENT'; }
\{\:\:[a-z_][a-z0-9_]*\}	{ return 'BINDING_IDENT_LIST'; }
"AS"	{ return 'AS'; }
"ASC"	{ return 'ASC'; }
"DESC"	{ return 'DESC'; }
"STRICT" { return 'STRICT'; }
"IN"	{ return 'IN'; }
"ON"	{ return 'ON'; }
"JOIN"	{ return 'JOIN'; }
"+"	{ return '+'; }
"-"	{ return '-'; }
"/"	{ return '/'; }
"*"	{ return '*'; }
"%"	{ return '%'; }
"==="	{ return '==='; }
"!=="	{ return '!=='; }
"=="	{ return '='; }
"="	{ return '='; }
"("	{ return '('; }
")"	{ return ')'; }
"<="	{ return '<='; }
">="	{ return '>='; }
"<"	{ return '<'; }
">"	{ return '>'; }
"AND"	{ return 'AND'; }
"&&"	{ return 'AND'; }
"OR"	{ return 'OR'; }
"||"	{ return 'OR'; }
"."	{ return '.'; }
"!="	{ return '!='; }
"!"	{ return '!'; }

"{" { return '{'; }
"}" { return '}'; }
":" { return ':'; }
"[" { return '['; }
"]" { return ']'; }

(\@([a-z_][a-z0-9_]*|))	{ return 'DATA_SOURCE_IDENT'; }
\`(\\.|[^\\`])*\`		{ return 'IDENT'; }
([a-z_][a-z0-9_]*)		{ return 'IDENT'; }

<<EOF>>	{ return 'EOF'; }

/lex

/* operator associations and precedence */

%left ','
%left 'AS'
%left 'AND' 'OR'
%left 'BETWEEN'

%left '.'
%left 'NOT'
%left '>' '<' '>=' '<='

%left '=' '==' '!=' '===' '!=='
%left '+' '-'
%left '*' '/' '%'

%left 'LIKE' 'ILIKE' 'REGEXP'

%left 'IS_KEYWORD'

%left 'UNARY_PREC'
%left '!'

%left 'COUNT'
%left 'FROM' 'AS' 'DISTINCT' 'STRICT' 'IN' 'WHERE' 'HAVING' 'LIMIT' 'OFFSET'
%left 'ORDER' 'GROUP' 'BY' 'ASC' 'DESC'
%left 'JOIN' 'INNER' 'LEFT'
%left 'DAY' 'YEAR' 'MONTH' 'DAYHOUR' 'HOUR' 'MINUTE' 'SECOND'
%left 'INTERVAL'

%left 'CALL_PREC'
%left '(' ')'

%start queries

%% /* language grammar */

queries
	: insert EOF { return $1; }
	| delete EOF { return $1; }
	| select EOF { return $1; }
	| update EOF { return $1; }
;

keywords
	: SELECT { $$ = $1 }
	| DELETE { $$ = $1 }
	| INSERT { $$ = $1 }
	| UPDATE { $$ = $1 }
	| SET { $$ = $1 }
	| FROM { $$ = $1 }
	| STRICT { $$ = $1 }
	| IN { $$ = $1 }
	| AND { $$ = $1 }
	| OR { $$ = $1 }
	| WHERE { $$ = $1 }
	| ORDER { $$ = $1 }
	| GROUP { $$ = $1 }
	| BY { $$ = $1 }
	| HAVING { $$ = $1 }
	| LIMIT { $$ = $1 }
	| OFFSET { $$ = $1 }
	| ASC { $$ = $1 }
	| DESC { $$ = $1 }
	| JOIN { $$ = $1 }
	| LEFT { $$ = $1 }
	| INNER { $$ = $1 }
	| INTERVAL { $$ = $1 }
	| YEAR { $$ = $1 }
	| MONTH { $$ = $1 }
	| DAY { $$ = $1 }
	| HOUR { $$ = $1 }
	| MINUTE { $$ = $1 }
	| SECOND { $$ = $1 }
	| LIKE { $$ = $1 }
	| ILIKE { $$ = $1 }
	| REGEXP { $$ = $1 }
	| NOT { $$ = $1 }
	| IS_KEYWORD { $$ = $1 }
	| STRING_KEYWORD { $$ = $1 }
	| NUMBER_KEYWORD { $$ = $1 }
	| BOOL_KEYWORD { $$ = $1 }
	| OBJECT_KEYWORD { $$ = $1 }
	| ARRAY_KEYWORD { $$ = $1 }
;

dataSourceIdent
	: 'DATA_SOURCE_IDENT' { $$ = new Nodes.DataSourceIdent($1) }
;

ident
	: 'IDENT' { $$ = new Nodes.Ident($1); }
	| 'BINDING_IDENT' { $$ = new Nodes.BindingIdent($1); }
	| keywords { $$ = new Nodes.Ident($1); }
;

complexIdent
	: complexIdent '.' ident { $1.addFragment($3); $$ = $1; }
	| complexIdent '.' 'BINDING_IDENT_LIST' { $1.addFragment(new Nodes.BindingIdentList($3)); $$ = $1; }
	| 'BINDING_IDENT_LIST' { $$ = new Nodes.ComplexIdent(['@', new Nodes.BindingIdentList($1)]); }
	| ident { $$ = new Nodes.ComplexIdent(['@', $1]); }
	| dataSourceIdent { $$ = new Nodes.ComplexIdent([$1.name]); }
;

number: 'NUMBER' { $$ = new Nodes.Number($1); };

intervalUnit
	: 'YEAR' { $$ = Nodes.Interval.UNIT_YEAR; }
	| 'MONTH' { $$ = Nodes.Interval.UNIT_MONTH; }
	| 'DAY' { $$ = Nodes.Interval.UNIT_DAY; }
	| 'HOUR' { $$ = Nodes.Interval.UNIT_HOUR; }
	| 'MINUTE' { $$ = Nodes.Interval.UNIT_MINUTE; }
	| 'SECOND' { $$ = Nodes.Interval.UNIT_SECOND; }
;

interval
	: 'INTERVAL' expression intervalUnit { $$ = new Nodes.Interval(); $$.add($2, $3); }
	| interval expression intervalUnit { $$.add($2, $3); }
;

jsonObjectItem
	: 'STRING' ':' expression { $$ = {key: (new Nodes.String($1)).value, value: $3}; }
	| ident ':' expression { $$ = {key: $1.name, value: $3}; }
;

jsonObjectItems
	: jsonObjectItem { $$ = {}; $$[$1.key] = $1.value; }
	| jsonObjectItems ',' jsonObjectItem { $$ = $1; $$[$3.key] = $3.value; }
;

jsonObject
	: '{' jsonObjectItems '}' { $$ = new Nodes.Map($2); }
	| '{' '}' { $$ = new Nodes.Map({}); }
;

jsonArray
	: '[' expressionsList ']' { $$ = new Nodes.Array($2.values); }
	| '[' ']' { $$ = new Nodes.Array([]); }
;

jsonValue
	: jsonArray { $$ = $1; }
	| jsonObject { $$ = $1; }
;

scalarConst
	: 'STRING' { $$ = new Nodes.String($1); }
	| number   { $$ = $1; }
	| 'NULL'   { $$ = new Nodes.Null(); }
	| 'TRUE'   { $$ = new Nodes.Boolean(true); }
	| 'FALSE'   { $$ = new Nodes.Boolean(false); }
;

const
	: scalarConst { $$ = $1; }
	| jsonValue { $$ = $1; }
;

expression
	: predicate
	| expression 'AND' expression { $$ = new Nodes.LogicalOperation($2, $1, $3); }
	| expression 'OR' expression { $$ = new Nodes.LogicalOperation($2, $1, $3); }
;

callExpression
	: complexIdent '(' expressionsList ')' { $$ = new Nodes.Call(new Nodes.FunctionIdent($1), $3); }
	| complexIdent '(' ')' { $$ = new Nodes.Call(new Nodes.FunctionIdent($1)); }
	| 'COUNT' '(' expression ')' { $$ = new Nodes.Call(new Nodes.FunctionIdent(new Nodes.ComplexIdent(['@', $1])), new Nodes.ExpressionsList([$3])); }
	| 'COUNT' '(' 'DISTINCT' expression ')' { $$ = new Nodes.Call(new Nodes.FunctionIdent(new Nodes.ComplexIdent(['@', 'COUNT_DISTINCT'])), new Nodes.ExpressionsList([$4])); }
	| 'COUNT' '(' '*' ')' { $$ = new Nodes.Call(new Nodes.FunctionIdent(new Nodes.ComplexIdent(['@', $1]))); }
	| 'COUNT' { $$ = new Nodes.ColumnIdent(['@', $1]) }
;

typeKeyword
	: 'STRING_KEYWORD' { $$ = $1 }
	| 'NUMBER_KEYWORD' { $$ = $1 }
	| 'BOOL_KEYWORD' { $$ = $1 }
	| 'OBJECT_KEYWORD' { $$ = $1 }
	| 'ARRAY_KEYWORD' { $$ = $1 }
;

isExpression
	: baseExpression 'IS_KEYWORD' typeKeyword { $$ = new Nodes.IsOperation($1, $3); }
	| baseExpression 'IS_KEYWORD' 'NULL' { $$ = new Nodes.IsOperation($1, $3); }
	| baseExpression 'IS_KEYWORD' 'NOT' typeKeyword { $$ = new Nodes.UnaryLogicalOperation('!', new Nodes.IsOperation($1, $4)); }
	| baseExpression 'IS_KEYWORD' 'NOT' 'NULL' { $$ = new Nodes.UnaryLogicalOperation('!', new Nodes.IsOperation($1, $4)); }
;

baseExpression
	: baseExpression '*' baseExpression { $$ = new Nodes.BinaryArithmeticOperation($2, $1, $3); }
	| baseExpression '%' baseExpression { $$ = new Nodes.BinaryArithmeticOperation($2, $1, $3); }
	| baseExpression '/' baseExpression { $$ = new Nodes.BinaryArithmeticOperation($2, $1, $3); }
	| baseExpression '+' baseExpression { $$ = new Nodes.BinaryArithmeticOperation($2, $1, $3); }
	| baseExpression '-' baseExpression { $$ = new Nodes.BinaryArithmeticOperation($2, $1, $3); }
	| baseExpression '+' interval { $$ = new Nodes.IntervalOperation($2, $1, $3); }
	| baseExpression '-' interval { $$ = new Nodes.IntervalOperation($2, $1, $3); }
	| baseExpression '=' baseExpression { $$ = new Nodes.ComparisonOperation($2, $1, $3); }
	| baseExpression '!==' baseExpression { $$ = new Nodes.ComparisonOperation($2, $1, $3); }
	| baseExpression '===' baseExpression { $$ = new Nodes.ComparisonOperation($2, $1, $3); }
	| baseExpression '!=' baseExpression { $$ = new Nodes.ComparisonOperation($2, $1, $3); }
	| baseExpression '>' baseExpression { $$ = new Nodes.ComparisonOperation($2, $1, $3); }
	| baseExpression '>=' baseExpression { $$ = new Nodes.ComparisonOperation($2, $1, $3); }
	| baseExpression '<' baseExpression { $$ = new Nodes.ComparisonOperation($2, $1, $3); }
	| baseExpression '<=' baseExpression { $$ = new Nodes.ComparisonOperation($2, $1, $3); }
	| '+' baseExpression { $$ = new Nodes.UnaryArithmeticOperation($1, $2); }
	| '-' baseExpression { $$ = new Nodes.UnaryArithmeticOperation($1, $2); }
	| '!' baseExpression { $$ = new Nodes.UnaryLogicalOperation($1, $2); }
	| baseExpression 'STRICT' 'IN' '(' expressionsList ')' { $$ = new Nodes.StrictIn($1, $5); }
	| baseExpression 'NOT' 'STRICT' 'IN' '(' expressionsList ')' { $$ = new Nodes.UnaryLogicalOperation('!', new Nodes.StrictIn($1, $6)); }
	| baseExpression 'IN' '(' expressionsList ')' { $$ = new Nodes.UnstrictIn($1, $4); }
	| baseExpression 'NOT' 'IN' '(' expressionsList ')' { $$ = new Nodes.UnaryLogicalOperation('!', new Nodes.UnstrictIn($1, $5)); }
	| callExpression %prec 'CALL_PREC' { $$ = $1 }
	| complexIdent { $$ = Nodes.ColumnIdent.fromComplexIdent($1) }
	| const { $$ = $1; }
	| 'BINDING_VALUE_SCALAR' { $$ = new Nodes.BindingValueScalar($1); }
	| '(' expression ')' { $$ = new Nodes.Brackets($2); }
	| baseExpression 'LIKE' baseExpression { $$ = new Nodes.LikeOperation($2, $1, $3); }
	| baseExpression 'ILIKE' baseExpression { $$ = new Nodes.LikeOperation($2, $1, $3); }
	| baseExpression 'NOT' 'LIKE' baseExpression { $$ = new Nodes.UnaryLogicalOperation('!', new Nodes.LikeOperation($3, $1, $4)); }
	| baseExpression 'NOT' 'ILIKE' baseExpression { $$ = new Nodes.UnaryLogicalOperation('!', new Nodes.LikeOperation($3, $1, $4)); }
	| baseExpression 'REGEXP' baseExpression { $$ = new Nodes.RegexpOperation($2, $1, $3); }
	| baseExpression 'NOT' 'REGEXP' baseExpression { $$ = new Nodes.UnaryLogicalOperation('!', new Nodes.RegexpOperation($3, $1, $4)); }
	| isExpression %prec 'IS_KEYWORD' { $$ = $1 }
;


// only for solving `BETWEEN ... AND ...` issue
predicate
	: baseExpression 'BETWEEN' baseExpression AND predicate { $$ = new Nodes.BetweenOperation($1, $3, $5); }
	| baseExpression 'NOT' 'BETWEEN' baseExpression AND predicate { $$ = new Nodes.UnaryLogicalOperation('!', new Nodes.BetweenOperation($1, $4, $6)); }
	| baseExpression
;

expressionsList
	: expressionsList ',' expression { $1.push($3); $$ = $1; }
	| expressionsList ',' 'BINDING_VALUE_LIST' { $1.push(new Nodes.BindingValueList($3)); $$ = $1; }
	| 'BINDING_VALUE_LIST' { $$ = new Nodes.ExpressionsList([new Nodes.BindingValueList($1)]); }
	| expression { $$ = new Nodes.ExpressionsList([$1]); }
;

column
	: expression 'AS' complexIdent { $$ = new Nodes.Column($1, $3); }
	| expression 'AS' 'COUNT' { $$ = new Nodes.Column($1, new Nodes.ColumnIdent(['@', $3])); }
	| expression            { var sql = yy.lexer[JL_JISON_INPUT_SYMBOL].slice(@$.range[0], @$.range[1]); $$ = new Nodes.Column($1, null, sql);}
;

columns
	: columns ',' columns    { $$ = $1.concat($3); }
	| column                 { $$ = [$1]; }
;

selectClause
	: 'SELECT' 'DISTINCT' { $$ = new Nodes.Select(); $$.distinct = true; }
	| 'SELECT' { $$ = new Nodes.Select(); }
;

deleteClause: 'DELETE' { $$ = new Nodes.Delete(); };
insertClause: 'INSERT' 'VALUES' { $$ = new Nodes.Insert(); };
updateClause: 'UPDATE' { $$ = new Nodes.Update(); };

selectColumns
	: selectClause columns { $1.columns = $2; $$ = $1; }
	| selectClause '*' ',' columns { $1.allColumns = true; $1.columns = $4; $$ = $1; }
	| selectClause '*' { $1.columns = []; $1.allColumns = true; $$ = $1; }
;

table
	: dataSourceReadable { $$ = new Nodes.Table($1); }
	| dataSourceReadable AS dataSourceIdent { $$ = new Nodes.Table($1, new Nodes.TableAlias($3)); }
;

dataSourceReadable
	: complexIdent { $$ = new Nodes.TableLocation($1); }
	| STRING { $$ = new Nodes.TableLocation(new Nodes.ComplexIdent([$1])); }
	| complexIdent '(' ')' { $$ = new Nodes.DataSourceCall(new Nodes.FunctionIdent($1)); }
	| complexIdent '(' dataSourceReadable ')' { $$ = new Nodes.DataSourceCall(new Nodes.FunctionIdent($1), $3); }
	| complexIdent '(' dataSourceReadable ',' const ')' { $$ = new Nodes.DataSourceCall(new Nodes.FunctionIdent($1), $3, $5); }
;

selectFrom
	: selectColumns 'FROM' table { $1.table = $3; $$ = $1; }
	| selectColumns { $1.table = null; $$ = $1; }
;

join
	: JOIN table 'ON' expression       { $$ = new Nodes.InnerJoin($2, $4); }
	| INNER JOIN table 'ON' expression { $$ = new Nodes.InnerJoin($3, $5); }
	| LEFT JOIN table 'ON' expression  { $$ = new Nodes.LeftJoin($3, $5); }
;

selectJoin
	: selectFrom join       { $$ = $1; $$.join($2); }
	| selectFrom            { $$ = $1; }
;

where: WHERE expression { $$ = $2; };

selectWhere
	: selectJoin where { $$ = $1; $$.where = $2; }
	| selectJoin { $$ = $1; }
;

deleteWhere
	: deleteClause where { $$ = $1; $$.where = $2; }
	| deleteClause { $$ = $1; }
;

insertValues
	: insertClause expression { $$ = new Nodes.Insert([$2]); }
	| insertValues ',' expression { $$ = $1; $$.push($3); }
;

updateSets
	: updateClause 'SET' complexIdent '=' expression { $$ = new Nodes.Update(); $$.sets.push(new Nodes.UpdateSet($3, $5)); }
	| updateSets ',' complexIdent '=' expression { $$ = $1; $$.sets.push(new Nodes.UpdateSet($3, $5)); }
;

updateWhere
	: updateSets where { $$ = $1; $$.where = $2; }
	| updateSets { $$ = $1; }
;

groupping
	: expression { $$ = new Nodes.GroupBy($1); }
;

grouppingList
	: grouppingList ',' groupping { $1.push($3); $$ = $1; }
	| groupping { $$ = [$1]; }
;

selectGroup
	: selectWhere GROUP BY grouppingList { $1.groups = $4; $$ = $1; }
	| selectWhere { $$ = $1; }
;

selectHaving
	: selectGroup HAVING expression { $1.having = $3; $$ = $1; }
	| selectGroup { $$ = $1; }
;

order
	: expression ASC  { $$ = new Nodes.OrderBy($1, $2) }
	| expression DESC { $$ = new Nodes.OrderBy($1, $2) }
	| expression      { $$ = new Nodes.OrderBy($1) }
	| expression NUMERIC ASC  { $$ = new Nodes.OrderBy($1, $3, $2) }
	| expression NUMERIC DESC { $$ = new Nodes.OrderBy($1, $3, $2) }
	| expression NUMERIC      { $$ = new Nodes.OrderBy($1, 'ASC', $2) }
;

ordersList
	: ordersList ',' order { $1.push($3); $$ = $1; }
	| order                { $$ = [$1]; }
;

selectOrder
	: selectHaving ORDER BY ordersList { $1.orders = $4; $$ = $1; }
	| selectHaving { $$ = $1; }
;

selectLimit
	: selectOrder LIMIT number ',' number { $1.setLimit($5.value, $3.value); $$ = $1; }
	| selectOrder LIMIT number OFFSET number { $1.setLimit($3.value, $5.value); $$ = $1; }
	| selectOrder LIMIT number { $1.setLimit($3.value); $$ = $1; }
	| selectOrder { $$ = $1 }
;

select
	: selectLimit { $$ = $1; }
;

delete
	: deleteWhere { $$ = $1; }
;

insert
	: insertValues { $$ = $1; }
;

update
	: updateWhere { $$ = $1; }
;
