'use strict';

const assert = require('assert');
const SqlNodes = require('../../../../src/sql/Nodes');
const Node = require('../../../../src/sql/Node');

describe('Each SQL node has childNodes() implemented', () => {
	for (const n in SqlNodes) {
		const ctor = SqlNodes[n];

		it(n, () => {
			assert.notStrictEqual(ctor.prototype.childNodes, Node.prototype.childNodes);
		});
	}
});
