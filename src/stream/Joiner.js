const JlTransform = require('./JlTransform');
const Readable = require('stream').Readable;

class Joiner extends Readable
{
	/**
	 *
	 * @param {Join} join
	 */
	constructor(join, mainValueCb, mainStreamSorted, joiningValueCb, joiningStreamSorted)
	{
		super({objectMode: true});

		this.inputType = JlTransform.ARRAYS_OF_OBJECTS;
		this.outputType = JlTransform.ARRAYS_OF_OBJECTS;

		this.join = join;
		this.mainStreamSorted = mainStreamSorted;
		this.joiningStreamSorted = joiningStreamSorted;

		this.mainValueCb = mainValueCb;
		this.joiningValueCb = joiningValueCb;

		this.currentKey = undefined;
		this.currentKeyMainRow = undefined;
		this.currentKeyBuffer = [];

		this.maxBufferSize = 16;
		this.mainBuffer = [];
		this.joiningBuffer = [];

		this.needOutput = false;

		this.mainEnded = false;
		this.joiningEnded = false;

		this.ended = false;

		mainStreamSorted.on('data', this.mainStreamData.bind(this));
		mainStreamSorted.on('end', this.mainStreamEnd.bind(this));
		joiningStreamSorted.on('data', this.joiningStreamData.bind(this));
		joiningStreamSorted.on('end', this.joiningStreamEnd.bind(this));
	}

	mainStreamData(data)
	{
		this.mainBuffer = this.mainBuffer.concat(data);

		if (this.mainBuffer.length >= this.maxBufferSize) {
			this.mainStreamSorted.pause();
		}

		this.dataChanged();
	}

	mainStreamEnd()
	{
		this.mainEnded = true;

		this.dataChanged();
	}

	joiningStreamData(data)
	{
		this.joiningBuffer = this.joiningBuffer.concat(data);

		if (this.joiningBuffer.length >= this.maxBufferSize) {
			this.joiningStreamSorted.pause();
		}

		this.dataChanged();
	}

	joiningStreamEnd()
	{
		this.joiningEnded = true;

		this.dataChanged();
	}

	tryResumeAll()
	{
		if (this.mainBuffer.length < this.maxBufferSize) {
			if (this.mainStreamSorted.isPaused()) {
				this.mainStreamSorted.resume();
			}
		}

		if (this.joiningBuffer.length < this.maxBufferSize) {
			if (this.joiningStreamSorted.isPaused()) {
				this.joiningStreamSorted.resume();
			}
		}
	}

	mainKey(row)
	{
		const v = this.mainValueCb(row);
		return v === undefined ? '' : JSON.stringify(v + '');
	}

	joiningKey(row)
	{
		const v = this.joiningValueCb(row);
		return v === undefined ? '' : JSON.stringify(v + '');
	}

	dataChanged()
	{
		if (this.needOutput) {
			this._read();
		}
	}

	popOutput()
	{
		let outputBuffer = [];

		while (this.mainBuffer.length && this.joiningBuffer.length) {
			const mainRow = this.mainBuffer[0];
			const joiningRow = this.joiningBuffer[0];

			const mainKey = this.mainKey(mainRow);
			const joiningKey = this.joiningKey(joiningRow);

			this.currentKeyMainRow = mainRow;

			if (this.currentKey !== mainKey) {
				this.currentKey = mainKey;

				if (this.currentKeyBuffer.length) {
					// буфер должен очищаться при завершении ключа
					throw new Error('assert');
				}
			}

			if (mainKey === joiningKey) {
				this.currentKeyBuffer.push(joiningRow);

				this.joiningBuffer.shift();
			} else if (joiningKey > mainKey) {
				this.mainBuffer.shift();

				/*
				 * поменялась mainRow - надо сгенерить пачку смердженных строк
				 * и вернуть присоединяемые строки обратно в обработку т.к. они,
				 * возможно, будут нужны для следующей строки основного потока
				 */
				if (this.currentKeyBuffer.length) {
					outputBuffer = this.generateOutputFromCurrentKeyBuffer();
					break;
				}
			} else { // mainKey > joiningKey
				this.joiningBuffer.shift();
			}
		}

		if (!this.joiningBuffer.length && this.joiningEnded) {
			outputBuffer = outputBuffer.concat(this.generateOutputFromCurrentKeyBuffer());
			this.mainBuffer.shift();
		}

		if (!this.mainBuffer.length && this.mainEnded) {
			outputBuffer = outputBuffer.concat(this.generateOutputFromCurrentKeyBuffer());
			this.ended = true;
		}

		this.tryResumeAll();

		return outputBuffer;
	}

	_read()
	{

		const output = this.popOutput();

		if (output.length) {
			this.push(output);
			this.needOutput = false;
		} else {
			this.needOutput = true;
			this.tryResumeAll();
		}

		if (this.ended) {
			this.push(null);
			return;
		}
	}

	mergeRows(mainRow, joiningRow)
	{
		const merged = JSON.parse(JSON.stringify(mainRow));

		merged.sources[this.join.joiningDataStream.name] = joiningRow.sources[this.join.joiningDataStream.name];

		return merged;
	}

	generateOutputFromCurrentKeyBuffer()
	{
		const outputBuffer = [];

		for (const joiningRow of this.currentKeyBuffer) {
			outputBuffer.push(this.mergeRows(this.currentKeyMainRow, joiningRow));
		}

		// возвращаем для обработки обрабтно в очередь
		this.joiningBuffer = this.currentKeyBuffer.concat(this.joiningBuffer);

		this.currentKeyBuffer = [];

		return outputBuffer;
	}
}

module.exports = Joiner;
