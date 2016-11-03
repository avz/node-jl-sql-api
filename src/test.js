const LineSplitter = require('./stream/LinesSplitter');
const JsonParser = require('./stream/JsonParser');
const JsonStringifier = require('./stream/JsonStringifier');
const LinesJoiner = require('./stream/LinesJoiner');

const Engine = require('./Engine');

var engine = new Engine;

process.stdin
	.pipe(new LineSplitter)
	.pipe(new JsonParser)
	.pipe(engine.createTransform(process.argv[2]))
	.pipe(new JsonStringifier)
	.pipe(new LinesJoiner)
	.pipe(process.stdout)
;
