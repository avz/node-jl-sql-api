all: sql.js

build: sql.js

sql.js: sql.jison
	../../node_modules/jison/lib/cli.js < ./sql.jison > ./sql.js

clean:
	rm -f sql.js
