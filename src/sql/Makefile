all: Parser.js

Parser.js: sql.jison
	../../node_modules/jison/lib/cli.js < ./sql.jison > ./Parser.js

clean:
	rm -f Parser.js
