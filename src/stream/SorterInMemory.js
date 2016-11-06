const JlTransform = require('./JlTransform');

/**
 * Тупейший алгоритм сортировки: сохраняем всё в памятьЮ а потом сортируем
 * TODO Переделать на нормальную схему
 */
class SorterInMemory extends JlTransform
{
	constructor(compare)
	{
		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.compare = compare;
		this.objects = [];
	}

	_transform(chunk, encoding, cb)
	{
		for (var i = 0; i < chunk.length; i++) {
			this.objects.push(chunk[i]);
		}

		cb();
	}

	_flush(cb)
	{
		this.objects.sort(this.compare);

		this.push(this.objects);
		this.objects = [];

		cb();
	}
}

module.exports = SorterInMemory;
