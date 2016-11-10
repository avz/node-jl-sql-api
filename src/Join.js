const Nodes = require('./sql/Nodes');

class Join
{
	constructor(preparingContext, joiningDataStream, ast)
	{
		this.preparingContext = preparingContext;
		this.joiningDataStream = joiningDataStream;
		this.ast = ast;


		this.joiningDataStreamSortingsColumns = [];
		this.mainDataStreamSortingsColumns = [];

		this.parseAst(ast);
	}

	parseAst(ast)
	{
		if (ast instanceof Nodes.Brackets) {
			return this.parseAst(ast.expression);
		}

		if (!(ast instanceof Nodes.ComparsionOperation)) {
			throw new Error('Only basic JOIN ON expression is supported: @source1.field1 = @source2.field2');
		}

		if (ast.operator !== '=') {
			throw new Error('Only operator = is supported yet in JOIN ON');
		}

		if (!(ast.left instanceof Nodes.ColumnIdent) || !(ast.right instanceof Nodes.ColumnIdent)) {
			throw new Error('Only basic JOIN ON expression is supported: @source1.field1 = @source2.field2');
		}

		const sortingJoining = [];
		const sortingMain = [];

		if (ast.left.fragments[0] === this.joiningDataStream.name) {
			sortingJoining.push(ast.left);
		} else {
			sortingMain.push(ast.left);
		}

		if (ast.right.fragments[0] === this.joiningDataStream.name) {
			sortingJoining.push(ast.right);
		} else {
			sortingMain.push(ast.right);
		}

		if (sortingJoining.length !== 1 || sortingMain.length !== 1) {
			throw new Error('Only basic JOIN ON expression is supported: @source1.field1 = @source2.field2');
		}

		this.joiningDataStreamSortingsColumns = sortingJoining;
		this.mainDataStreamSortingsColumns = sortingMain;
	}
}

module.exports = Join;
