const LineSplitter = require('./stream/LinesSplitter');
const JsonParser = require('./stream/JsonParser');
const JsonStringifier = require('./stream/JsonStringifier');
const DebugDumper = require('./stream/DebugDumper');
const Terminator = require('./stream/Terminator');
const Sorter = require('./stream/Sorter');
const LinesJoiner = require('./stream/LinesJoiner');

process.stdin
		.pipe(new LineSplitter)
		.pipe(new JsonParser)
		.pipe(new Sorter(function(a, b) {
			return a > b;
		}))
		.pipe(new JsonStringifier)
		.pipe(new LinesJoiner)
		.pipe(process.stdout)
;

/*
const SqlParser = require('./sql/parser');
const SqlNodes = require('./sql/Nodes');

console.log(extractColumnIdentsFromSelect(SqlParser.parse(process.argv[2])));

function extractColumnIdentsFromSelect(select) {
	console.log(select);
	function extractColumns(nodes) {
		var columns = [];

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];

			if (node instanceof SqlNodes.ColumnIdent) {
				columns.push(node);
			}
//console.log(node);
			columns = columns.concat(extractColumns(node.childNodes()));
		}

		return columns;
	};

	return extractColumns(select.columns);
}

*/

/*
 * - читаем поток байтов (если надо)
 *   - бьём на строки [LinesSplitter]
 *   - парсим [JsonParser]
 * - оставляем только нужные поля [Picker]
 * - генерим альясы (можно оставить их динамическими и вычислять при использовании) [Aliaser]
 * - группируем если надо [Aggregator]
 *   - сортируем [Sorter]
 *   - группируем [Reducer]
 * - сортируем [Sorter]
 * - делаем limit [Limiter]
 */

/*
 * Виды потоков:
 * - обычный readable stream с байтами внутри
 * - поток готовых объектов
 * - поток иммутабельных объектов с приаттаченным JSON
 */
