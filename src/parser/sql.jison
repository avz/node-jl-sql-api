%{
var nodes = require('./nodes.js');

%}

/* lexical grammar */
%lex

%options case-insensitive

%%
\s+	{}
","	{ return ','; }
"NULL"	{ return 'NULL'; }
"TRUE"	{ return 'TRUE'; }
"FALSE"	{ return 'FALSE'; }
"SELECT"	{ return 'SELECT'; }
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
\"(\\.|[^\\"])*\"	{ return 'STRING'; }
\'(\\.|[^\\'])*\'	{ return 'STRING'; }
[+-]?[0-9][0-9.]*	{ return 'NUMBER'; }
"AS"	{ return 'AS'; }
"ASC"	{ return 'ASC'; }
"DESC"	{ return 'DESC'; }
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

\`(\\.|[^\\`])*\`	{ return 'IDENT'; }
([a-z_][a-z0-9_-]*)	{ return 'IDENT'; }

<<EOF>>	{ return 'EOF'; }

/lex

/* operator associations and precedence */

%left ','
%left 'AS'
%left 'AND' 'OR'
%left '>' '<' '>=' '<='

%left '+' '-'
%left '*' '/' '%'
%left '=' '==' '!=' '===' '!=='
%left 'FROM' 'AS' 'DISTINCT' 'IN' 'WHERE' 'HAVING' 'LIMIT' 'OFFSET'
%left 'ORDER' 'GROUP' 'BY' 'ASC' 'DESC'
%left 'JOIN' 'INNER' 'LEFT'
%left '.' '!'

%start expressions

%% /* language grammar */

expressions
	: select EOF
		{ return $1; }
	;

keywords
	: SELECT { $$ = $1 }
	| FROM { $$ = $1 }
	| AS { $$ = $1 }
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
;

ident
	: 'IDENT' { $$ = new nodes.Ident($1); }
	| keywords { $$ = new nodes.Ident($1); }
;

complexIdent
	: complexIdent '.' ident { $1.fragments.push($3.name); $$ = $1; }
	| ident { $$ = new nodes.ComplexIdent($1.name); }
;

number: 'NUMBER' { $$ = new nodes.Number($1); };

const
	: 'STRING' { $$ = new nodes.String($1); }
	| number   { $$ = $1; }
	| 'NULL'   { $$ = new nodes.Null(); }
	| 'TRUE'   { $$ = new nodes.Boolean(true); }
	| 'FALSE'   { $$ = new nodes.Boolean(false); }
;

expression
	: DISTINCT expression       { $$ = new nodes.Distinct($2); }
	| expression '*' expression { $$ = new nodes.BinaryOperation($2, $1, $3); }
	| expression '%' expression { $$ = new nodes.BinaryOperation($2, $1, $3); }
	| expression '/' expression { $$ = new nodes.BinaryOperation($2, $1, $3); }
	| expression '+' expression { $$ = new nodes.BinaryOperation($2, $1, $3); }
	| expression '-' expression { $$ = new nodes.BinaryOperation($2, $1, $3); }
	| expression '=' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| expression '!==' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| expression '===' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| expression '!=' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| expression 'AND' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| expression 'OR' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| expression '>' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| expression '>=' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| expression '<' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| expression '<=' expression { $$ = new nodes.ComparsionOperation($2, $1, $3); }
	| '-' expression { $$ = new nodes.UnaryOperation($1, $2); }
	| '!' expression { $$ = new nodes.UnaryOperation($1, $2); }
	| expression 'IN' '(' expressionsList ')' { $$ = new nodes.In($1, $4); }
	| complexIdent '(' expressionsList ')' { $$ = new nodes.Call(new nodes.FunctionIdent($1), $3); }
	| complexIdent '(' ')' { $$ = new nodes.Call(new nodes.FunctionIdent($1), []); }
	| 'COUNT' '(' expression ')' { $$ = new nodes.Call(new nodes.FunctionIdent(new nodes.ComplexIdent($1)), [$3]); }
	| 'COUNT' '(' '*' ')' { $$ = new nodes.Call(new nodes.FunctionIdent(new nodes.ComplexIdent($1)), []); }
	| complexIdent { $$ = new nodes.ColumnIdent($1); }
	| const { $$ = $1; }
	| '(' expression ')' { $$ = new nodes.Brackets($2); }
;

expressionsList
	: expressionsList ',' expression { $1.push($3); $$ = $1; }
	| expression { $$ = [$1]; }
;

column
	: expression 'AS' ident { $$ = new nodes.Column($1, new nodes.ColumnAlias($3)); }
	| expression            { $$ = new nodes.Column($1); }
;

columns
	: columns ',' columns    { $$ = $1.concat($3); }
	| column                 { $$ = [$1]; }
;

selectClause: 'SELECT' { $$ = new nodes.Select(); };

selectColumns: selectClause columns { $1.columns = $2; $$ = $1; };
selectColumns: selectClause '*' { $1.columns = null; $$ = $1; };

table
	: complexIdent AS ident { $$ = new nodes.Table(new nodes.TableIdent($1), new nodes.TableAlias($3)); }
	| complexIdent { $$ = new nodes.Table(new nodes.TableIdent($1)); }
;

selectFrom
	: selectColumns 'FROM' table { $1.table = $3; $$ = $1; }
	| selectColumns { $1.table = null; $$ = $1; }
;

selectJoin
	: selectFrom JOIN table 'ON' expression       { $1.join(new nodes.InnerJoin($3, $5)); $$ = $1; }
	| selectFrom INNER JOIN table 'ON' expression { $1.join(new nodes.InnerJoin($4, $6)); $$ = $1; }
	| selectFrom LEFT JOIN table 'ON' expression  { $1.join(new nodes.LeftJoin($4, $6)); $$ = $1; }
	| selectFrom { $$ = $1; }
;

selectWhere
	: selectJoin WHERE expression { $1.where = $3; $$ = $1; }
	| selectJoin { $$ = $1; }
;

selectGroup
	: selectWhere GROUP BY expressionsList { $1.groups = $4; $$ = $1; }
	| selectWhere { $$ = $1; }
;

selectHaving
	: selectGroup HAVING expression { $1.having = $3; $$ = $1; }
	| selectGroup { $$ = $1; }
;

order
	: expression ASC  { $$ = new nodes.Order($1, $2) }
	| expression DESC { $$ = new nodes.Order($1, $2) }
	| expression      { $$ = new nodes.Order($1) }
	| expression NUMERIC ASC  { $$ = new nodes.Order($1, $3, $2) }
	| expression NUMERIC DESC { $$ = new nodes.Order($1, $3, $2) }
	| expression NUMERIC      { $$ = new nodes.Order($1, 'ASC', $2) }
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
