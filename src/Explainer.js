'use strict';

const JlTransformsChain = require('./stream/JlTransformsChain');

class Explainer
{
	createExplain(transformsChain)
	{
		return this._createItemsByTransform(transformsChain);
	}

	_createItemsByTransform(stream)
	{
		const explain = {
			type: stream.constructor.name
		};

		if (stream instanceof JlTransformsChain) {
			explain.childs = [];

			for (const child of stream.streams) {
				explain.childs.push(this._createItemsByTransform(child));
			}
		}

		return explain;
	}
}

module.exports = Explainer;
