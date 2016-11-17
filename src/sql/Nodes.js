'use strict';

const fs = require('fs');
const path = require('path');

const nodesRoot = path.join(__dirname, 'nodes');

/* TODO static require() */

fs.readdirSync(path.join(__dirname, 'nodes')).forEach(function(file) {
	const p = path.parse(file);
	if (p.ext !== '.js') {
		return;
	}

	exports[p.name] = require(path.join(nodesRoot, file));
});
