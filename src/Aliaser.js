'use strict';

const ComplexIdentsMap = require('./ComplexIdentsMap');
const BasicColumn = require('./BasicColumn');
const Nodes = require('./sql/Nodes');

class Aliaser
{
	/**
	 *
	 * @param {BasicColumn[]|AggregationColumn[]} analysedColumns
	 * @returns {nm$_Aliaser.Aliaser}
	 */
	constructor(analysedColumns)
	{
		this.map = new ComplexIdentsMap;

		for (const [, column] of analysedColumns) {
			if (!(column instanceof BasicColumn)) {
				continue;
			}

			if (!column.isUserDefinedAlias) {
				continue;
			}

			this.map.add(column.alias, column);
		}
	}

	expandInplace(expression)
	{
		expression.eachChildNodeRecursive(node => {
			if (!(node instanceof Nodes.ColumnIdent)) {
				return;
			}

			const aliased = this.map.get(node.getFragments());

			if (!aliased) {
				return;
			}

			node.expandAlias(aliased.expression);
		});
	}
}

module.exports = Aliaser;
