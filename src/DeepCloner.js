'use strict';

class DeepCloner
{
	static clone(value)
	{
		const type = typeof(value);

		if (type !== 'object' || value === null) {
			return value;
		}

		/* eslint-disable indent, no-unreachable */
		switch (value.constructor) {
			case Array:
				return DeepCloner.cloneArray(value);
			break;
			case Date:
				return DeepCloner.cloneDate(value);
			break;
			default:
				return DeepCloner.cloneRawObject(value);
		}
		/* eslint-enable indent no-unreachable */
	}

	static cloneArray(array)
	{
		return array.slice().map(DeepCloner.clone);
	}

	static cloneDate(date)
	{
		return new Date(date.valueOf());
	}

	static cloneRawObject(object)
	{
		const copy = {};

		for (const k in object) {
			copy[k] = DeepCloner.clone(object[k]);
		}

		return copy;
	}
}

module.exports = DeepCloner;
