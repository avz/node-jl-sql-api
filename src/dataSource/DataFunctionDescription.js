'use strict';

const ProgramError = require('../error/ProgramError');
const DataSource = require('../DataSource');

class DataFunctionDescription
{
	constructor(type, name, ctor, inputType, outputType)
	{
		if (type !== DataFunctionDescription.TYPE_READ && type !== DataFunctionDescription.TYPE_TRANSFORM) {
			throw new ProgramError('Invalid type: ' + type);
		}

		if (!outputType) {
			throw new ProgramError('Output type must be specified');
		}

		if (outputType !== DataSource.TYPE_ARRAY_OF_ROWS && outputType !== DataSource.TYPE_BINARY) {
			throw new ProgramError('Invalid data source function outputType: ' + outputType);
		}

		if (type === DataFunctionDescription.TYPE_TRANSFORM && !inputType) {
			throw new ProgramError('Input type must be specified');
		}

		if (type === DataFunctionDescription.TYPE_READ && inputType) {
			throw new ProgramError('Input type must be null');
		}

		if (inputType && (inputType !== DataSource.TYPE_ARRAY_OF_ROWS && inputType !== DataSource.TYPE_BINARY)) {
			throw new ProgramError('Invalid data source function inputType: ' + inputType);
		}

		this.type = type;
		this.name = name;
		this.ctor = ctor;
		this.inputType = inputType;
		this.outputType = outputType;
	}

	createStream(input, options = {})
	{
		const ctor = this.ctor;
		// arrow functions has no `prototype` and cannot be used in `new`
		const stream = ctor.prototype ? (new ctor(input, options)) : ctor(input, options);

		return stream;
	}

	isRead()
	{
		return this.type === DataFunctionDescription.TYPE_READ;
	}

	isTransform()
	{
		return this.type === DataFunctionDescription.TYPE_TRANSFORM;
	}
}

DataFunctionDescription.TYPE_READ = 'read';
DataFunctionDescription.TYPE_TRANSFORM = 'transform';

module.exports = DataFunctionDescription;
