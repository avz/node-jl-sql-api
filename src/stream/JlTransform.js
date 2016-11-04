const Transform = require('stream').Transform;

class JlTransform extends Transform
{
	constructor(inputType, outputType)
	{
		super({
			objectMode: true
		});

		this.inputType = inputType;
		this.outputType = outputType;
	}

	pipe(destination, options)
	{
		if (!(destination instanceof JlTransform)) {
			return super.pipe(destination, options);
		}

		if (this.outputType === destination.inputType || destination.inputType === JlTransform.ANY) {
			return super.pipe(destination, options);
		}

		if (destination.inputType === JlTransform.RAW) {
			return this.toRawStream().pipe(destination, options);
		}

		if (destination.inputType === JlTransform.OBJECTS) {
			return this.toObjectsStream().pipe(destination, options);
		}

		if (destination.inputType === JlTransform.ARRAYS_OF_OBJECTS) {
			return this.toArraysOfObjectsStream().pipe(destination, options);
		}

		throw new Error('Unknown input stream type: ' + destination.inputType);
	}

	toRawStream()
	{
		throw new Error('You need to use appropriate serializer explicitly');
	}

	toObjectsStream()
	{
		if (this.outputType === JlTransform.OBJECTS) {
			return this;
		}

		if (this.outputType === JlTransform.RAW) {
			throw new Error('You need to use appropriate unserializer explicitly');
		}

		if (this.outputType !== JlTransform.ARRAYS_OF_OBJECTS) {
			throw new Error('Unknown stream output type: ' + this.outputType);
		}

		return this.pipe(new JlTransform_ArraysOfObjects_To_Objects());
	}

	toArraysOfObjectsStream()
	{
		if (this.outputType === JlTransform.ARRAYS_OF_OBJECTS) {
			return this;
		}

		if (this.outputType === JlTransform.RAW) {
			throw new Error('You need to use appropriate unserializer explicitly');
		}

		if (this.outputType !== JlTransform.OBJECTS) {
			throw new Error('Unknown stream output type: ' + this.outputType);
		}

		return this.pipe(new JlTransform_Objects_To_ArraysOfObjects());
	}
}

JlTransform.RAW = 'JlTransform.RAW';
JlTransform.ANY = 'JlTransform.ANY';
JlTransform.OBJECTS = 'JlTransform.OBJECTS';
JlTransform.ARRAYS_OF_OBJECTS = 'JlTransform.ARRAYS_OF_OBJECTS';

module.exports = JlTransform;

class JlTransform_ArraysOfObjects_To_Objects extends JlTransform
{
	constructor()
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.OBJECTS);
	}

	_transform(chunk, charset, cb)
	{
		for (var i = 0; i < chunk.length; i++) {
			this.push(chunk[i]);
		}

		cb();
	}
}

class JlTransform_Objects_To_ArraysOfObjects extends JlTransform
{
	constructor(chunkMaxSize = 100)
	{
		super(JlTransform.OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.chunkMaxSize = chunkMaxSize;
		this.chunk = [];
	}

	_transform(object, charset, cb)
	{
		this.chunk.push(object);

		if (this.chunk.length >= this.chunkMaxSize) {
			this.push(this.chunk);
			this.chunk = [];
		}

		cb();
	}

	_flush(cb)
	{
		this.push(this.chunk);
		this.chunk = [];

		cb();
	}
}

JlTransform.ArraysOfObjects_To_Objects = JlTransform_ArraysOfObjects_To_Objects;
JlTransform.Objects_To_ArraysOfObjects = JlTransform_Objects_To_ArraysOfObjects;
