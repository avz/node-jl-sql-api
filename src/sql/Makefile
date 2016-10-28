all: Sql.js

build: Sql.js

Sql.js: sql.jison
	../../node_modules/jison/lib/cli.js < ./sql.jison > ./Sql.js

clean:
	rm -f Sql.js
