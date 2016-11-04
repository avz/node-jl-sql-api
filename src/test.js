const PublicApi = require('./PublicApi');
const api = new PublicApi;

process.stdin
	.pipe(
		api.query(process.argv[2])
			.fromJsonStream()
			.toJsonStream()
	)
	.pipe(process.stdout)
;
