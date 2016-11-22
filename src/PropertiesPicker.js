'use strict';

class PropertiesPicker
{
	constructor(paths)
	{
		this.paths = paths;
		this.slicer = PropertiesPicker._compileProceduralSlicer(paths);
	}

	sliceProperties(from)
	{
		return this.slicer(from);
	}

	static _compileLiteralSlicer(paths)
	{
		const env = {
			functions: []
		};

		const resultObject = {};

		for (const [path, source] of paths) {
			if (typeof(source) === 'function') {
				env.functions.push(source);
				PropertiesPicker._objectSetProperty(
					path,
					resultObject,
					'env.functions[' + (env.functions.length - 1) + '](row)'
				);
			} else {
				PropertiesPicker._objectSetProperty(path, resultObject, PropertiesPicker._compileGetterCode(source));
			}
		}

		const deepGen = (val) => {
			if (typeof(val) === 'string') {
				return val;
			}

			const lines = [];

			for (const k in val) {
				const v = val[k];
				const code = deepGen(v);
				const indentedCode = code.replace(/\n(.+)/g, '\n\t$1');

				lines.push('\t' + JSON.stringify(k) + ': ' + indentedCode);
			}

			return '{\n' + lines.join(',\n') + '\n}';
		};

		const code = 'return ' + deepGen(resultObject);

		return (new Function('env', 'row', code)).bind(undefined, env);
	}

	static _compileProceduralSlicer(paths)
	{
		const env = {
			functions: []
		};

		const resultObject = {};

		for (const [path, source] of paths) {
			if (typeof(source) === 'function') {
				env.functions.push(source);
				PropertiesPicker._objectSetProperty(
					path,
					resultObject,
					'env.functions[' + (env.functions.length - 1) + '](row)'
				);
			} else {
				PropertiesPicker._objectSetProperty(path, resultObject, PropertiesPicker._compileGetterCode(source));
			}
		}

		const genObjectLiteral = (val) => {
			const lines = [];

			for (const k in val) {
				const v = val[k];

				if (typeof(v) === 'string') {
					continue;
				}

				const code = genObjectLiteral(v);
				const indentedCode = code.replace(/\n(.+)/g, '\n\t$1');

				lines.push('\t' + JSON.stringify(k) + ': ' + indentedCode);
			}

			return '{\n' + lines.join(',\n') + '\n}';
		};

		const genPropertiesAssigns = (prefix, path, val, tmpVar) => {
			const lines = [];

			for (const k in val) {
				const v = val[k];
				const propIdent = prefix + '[' + JSON.stringify(k) + ']';

				if (typeof(v) !== 'string') {
					lines.push(...genPropertiesAssigns(propIdent, path.concat([k]), v, tmpVar));
					continue;
				}

				let code = tmpVar + ' = ' + v + ';\n';

				code += 'if (' + tmpVar + ' !== undefined) {\n';
				code += '\t' + propIdent + ' = tmp;\n';
				code += '}\n';

				lines.push(code);
			}

			return lines;
		};

		let code = 'const result = ' + genObjectLiteral(resultObject) + ';\n\n';

		code += 'let tmp;\n\n';
		code += genPropertiesAssigns('result', [], resultObject, 'tmp').join('\n') + '\n';
		code += 'return result;\n';

		return (new Function('env', 'row', code)).bind(undefined, env);
	}

	static _compileGetterCode(path)
	{
		var levels = [];
		var rel = 'row';

		for (let i = 0; i < path.length - 1; i++) {
			const fragment = path[i];

			rel += '[' + JSON.stringify(fragment) + ']';
			levels.push('(' + rel + ' || undefined)');
		}

		levels.push(rel + '[' + JSON.stringify(path[path.length - 1]) + ']');

		if (levels.length > 1) {
			return '(' + levels.join(' && ') + ')';
		} else {
			return levels[0];
		}
	}

	static _objectSetProperty(path, obj, value)
	{
		function deepSet(path, pathOffset, obj, value)
		{
			const seg = path[pathOffset];

			if (pathOffset >= path.length - 1) {
				obj[seg] = value;

				return true;
			}

			var childObject;

			if (seg in obj) {
				childObject = obj[seg];
			} else {
				childObject = {};
			}

			if (typeof(childObject) !== 'object' || childObject === null) {
				return false;
			}

			const found = deepSet(path, pathOffset + 1, childObject, value);

			if (found) {
				obj[seg] = childObject;
			}

			return found;
		}

		return deepSet(path, 0, obj, value);
	}
}

module.exports = PropertiesPicker;
