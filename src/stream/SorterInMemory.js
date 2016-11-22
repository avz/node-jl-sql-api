'use strict';

const JlTransform = require('./JlTransform');
const Order = require('../Order');
const DataType = require('../DataType');

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

				let v1 = order.valueFunction(row1);
				let v2 = order.valueFunction(row2);

				if (order.valueFunction.dataType === DataType.MIXED) {
					v1 = v1 === undefined ? '' : JSON.stringify(v1 + '');
					v2 = v2 === undefined ? '' : JSON.stringify(v2 + '');
				}

				const direction = order.direction === Order.DIRECTION_DESC ? -1 : 1;

				if (v1 > v2) {
					return direction;
				} else if (v1 < v2) {
					return -direction;
				}
			}

			return 0;
		};

		return compare;
	}
}

module.exports = SorterInMemory;
