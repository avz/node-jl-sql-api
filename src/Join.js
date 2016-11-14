const Nodes = require('./sql/Nodes');
const SqlNotSupported = require('./error/SqlNotSupported');

class Join
{
	constructor(type, preparingContext, joiningSourceStream, joiningDataSourceName, ast)
	{
		this.type = type;
		this.preparingContext = preparingContext;
		this.joiningDataSource = joiningSourceStream;
		this.joiningDataSourceName = joiningDataSourceName;
		this.ast = ast;

		this.joiningDataSourceSortingsColumns = [];
		this.mainDataSourceSortingsColumns = [];

		this.parseAst(ast);
	}

	parseAst(ast)
	{
		if (ast instanceof Nodes.Brackets) {
			return this.parseAst(ast.expression);
		}

		if (!(ast instanceof Nodes.ComparsionOperation)) {
			throw new SqlNotSupported('Only basic JOIN ON expression is supported: @source1.field1 = @source2.field2');
		}

		if (ast.operator !== '=') {
			throw new SqlNotSupported('Only operator = is supported yet in JOIN ON');
		}

		if (!(ast.left instanceof Nodes.ColumnIdent) || !(ast.right instanceof Nodes.ColumnIdent)) {
			throw new SqlNotSupported('Only basic JOIN ON expression is supported: @source1.field1 = @source2.field2');
		}

		const sortingJoining = [];
		const sortingMain = [];

		if (ast.left.fragments[0] === this.joiningDataSourceName) {
			sortingJoining.push(ast.left);
		} else {
			sortingMain.push(ast.left);
		}

		if (ast.right.fragments[0] === this.joiningDataSourceName) {
			sortingJoining.push(ast.right);
		} else {
			sortingMain.push(ast.right);
		}

		if (sortingJoining.length !== 1 || sortingMain.length !== 1) {
			throw new SqlNotSupported('Only basic JOIN ON expression is supported: @source1.field1 = @source2.field2');
		}

		this.joiningDataSourceSortingsColumns = sortingJoining;
		this.mainDataSourceSortingsColumns = sortingMain;
	}
}

Join.LEFT = 'LEFT';
Join.INNER = 'INNER';

module.exports = Join;
