'use strict';

class PropertiesPicker
{
	/**
	 *
	 * @param {Map} paths
	 * @returns {PropertiesPicker}
	 */
	constructor(paths)
	{
		this.paths = paths;
		this.slicer = PropertiesPicker._compileSlicerProcedural(paths);
		this.merger = PropertiesPicker._compileMergerProcedural(paths);
	}

	/**
	 * Создаёт новый объект, в которй копирует указанный набор свойств
	 * @param {object} from
	 * @returns {object}
	 */
	sliceProperties(from)
	{
		return this.slicer(from);
	}

	/**
	 * Копирует свойства из одного объекта в другой
	 * @param {object} from
	 * @param {object} to
	 * @returns {object}
	 */
	mergeProperties(from, to)
	{
		return this.merger(from, to);
	}

	/**
	 *
	 * @param {Map} paths
	 * @returns {Function}
	 */
	static _compileMergerProcedural(paths)
	{
		const env = {
			functions: []
		};

		let code = '';

		for (const [path, source] of paths) {
			let getter;

			if (typeof(source) === 'function') {
				env.functions.push(source);
				getter = 'env.functions[' + (env.functions.length - 1) + '](row)';
			} else {
				getter = PropertiesPicker._compileGetterCode(source);
			}

			code += 'do {\n';
			let v = 'to';

			for (const i in path) {
				const p = path[i];

				code += '\tif (typeof(' + v + ') !== "object" || ' + v + ' === null) {\n';
				code += '\t\tcontinue;\n';
				code += '\t}';

				if (i < path.length - 1) {
					code += 'else if (!(' + JSON.stringify(p) + ' in ' + v + ')) {\n';
					code += '\t\t' + v + '[' + JSON.stringify(p) + '] = {};\n';
					code += '\t}';
				}

				code += '\n\n';

				v += '[' + JSON.stringify(p) + ']';
			}

			code += '\t' + v + ' = ' + getter + ';\n';

			code += '} while(false);\n\n';
		}

		code += 'return to;\n';

		return (new Function('env', 'row', 'to', code)).bind(undefined, env);
	}

	/**
	 *
	 * @param {Map} paths
	 * @returns {Function}
	 */
	static _compileSlicerProcedural(paths)
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

		let code = 'var result = ' + genObjectLiteral(resultObject) + ';\n\n';

		code += 'var tmp;\n\n';
		code += genPropertiesAssigns('result', [], resultObject, 'tmp').join('\n') + '\n';
		code += 'return result;\n';

		return (new Function('env', 'row', code)).bind(undefined, env);
	}

	/**
	 *
	 * @param {Map} path
	 * @returns {String}
	 */
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

	/**
	 *
	 * @param {Map} path
	 * @param {object} obj
	 * @param {mixed} value
	 * @returns {Boolean}
	 */
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
