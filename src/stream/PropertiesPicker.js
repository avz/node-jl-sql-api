const JlTransform = require('./JlTransform');

class PropertiesPicker extends JlTransform
{
	constructor(paths)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.paths = paths;
	}

	_transform(chunk, encoding, cb)
	{
		var result = [];

		for (let i = 0; i < chunk.length; i++) {
			var dest = {};

			this.copyProperties(this.paths, chunk[i], dest);

			result.push(dest);
		}

		this.push(result);

		cb();
	}

	copyProperties(paths, from, to)
	{
		if (paths instanceof Map) {
			return this.copyPropertiesMap(paths, from, to);
		} else {
			return this.copyPropertiesList(paths, from, to);
		}
	}

	copyPropertiesList(paths, from, to)
	{
		for (let i = 0; i < paths.length; i++) {
			copyProperty(paths[i], from, to);
		}
	}

	copyPropertiesMap(paths, from, to)
	{
		for (let [alias, source] of paths) {
			let value = this.getProperty(source, from);

			if (value === undefined) {
				continue;
			}

			this.setProperty(alias, to, value);
		}
	}

	getProperty(path, obj)
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

		return deepGet(path, 0, obj);
	}

	setProperty(path, obj, value)
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

	copyProperty(path, from, to)
	{
		var value = this.getProperty(path, from);

		if (value === undefined) {
			return false;
		}

		return this.setProperty(path, to, value);
	}
}

module.exports = PropertiesPicker;
