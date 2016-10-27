var parser = require('./parser/sql');

console.log(parser.parse(process.argv[2]));
