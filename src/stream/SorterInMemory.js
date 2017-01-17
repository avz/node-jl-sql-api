'use strict';

const JlTransform = require('./JlTransform');
const Order = require('../Order');
const Collator = require('../Collator');

const ProgramError = require('../error/ProgramError');

/**
 * Тупейший алгоритм сортировки: сохраняем всё в памятьЮ а потом сортируем
 * TODO Переделать на нормальную схему
 */
class SorterInMemory extends JlTransform
{
	constructor(orders)
	{
		if (!orders.length) {
			throw new ProgramError('Empty orders');
		}

		super(JlTransform.ARRAYS_OF_OBJECTS, JlTransform.ARRAYS_OF_OBJECTS);

		this.orders = orders;
		this.objects = [];
	}

	bufferSize()
	{
		return this.objects.length;
	}

	buffer()
	{
		return this.objects;
	}

	clear()
	{
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
		this.objects.sort(this.sortingFunction());

		this.push(this.objects);
		this.objects = [];

		cb();
	}

	sortingFunction()
	{
		const compare = (row1, row2) => {
			for (let i = 0; i < this.orders.length; i++) {
				const order = this.orders[i];
				const direction = order.direction === Order.DIRECTION_DESC ? -1 : 1;

				const key1 = order.valueFunction(row1);
				const key2 = order.valueFunction(row2);

				const diff = Collator.compareSortKeys(order.dataType, key1, key2);

				if (diff) {
					return direction * diff;
				}
			}

			return 0;
		};

		return compare;
	}
}

module.exports = SorterInMemory;
