'use strict';

class PropertiesPicker
{
	constructor(paths)
	{
		this.paths = paths;
	}

	copyProperties(from, to)
	{
		if (this.paths instanceof Map) {
			return this.copyPropertiesMap(this.paths, from, to);
		} else {
			return this.copyPropertiesList(this.paths, from, to);
		}
	}

	copyPropertiesList(paths, from, to)
	{
		for (let i = 0; i < paths.length; i++) {
			PropertiesPicker.copyProperty(paths[i], from, to);
		}
	}

	copyPropertiesMap(paths, from, to)
	{
		for (const [alias, source] of paths) {
			let value;

			if (typeof(source) === 'function') {
				value = source(from);
			} else {
				value = PropertiesPicker.getProperty(source, from);
			}

			if (value === undefined) {
				continue;
			}

			PropertiesPicker.setProperty(alias, to, value);
		}
	}

	static getProperty(path, obj)
	{
		function deepGet(path, pathOffset, obj)
		{
			const seg = path[pathOffset];

			if (!(seg in obj)) {
				return undefined;
			}

			if (pathOffset >= path.length - 1) {
				return obj[seg];
			}

			if (typeof(obj[seg]) !== 'object' || obj[seg] === null) {
				return undefined;
			}

			return deepGet(path, pathOffset + 1, obj[seg]);
		}

		if (typeof(obj) !== 'object' || obj === null) {
			return undefined;
		}

		return deepGet(path, 0, obj);
	}

	static setProperty(path, obj, value)
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

	static copyProperty(path, from, to)
	{
		var value = PropertiesPicker.getProperty(path, from);

		if (value === undefined) {
			return false;
		}

		return PropertiesPicker.setProperty(path, to, value);
	}
}

module.exports = PropertiesPicker;
