'use strict';

class Order
{
	/**
	 *
	 * @param {Function} valueFunction
	 * @param {string} direction
	 * @param {string} dataType
	 * @returns {Order}
	 */
	constructor(valueFunction, direction, dataType)
	{
		this.valueFunction = valueFunction;
		this.direction = direction;
		this.dataType = dataType;
	}
}

Order.DIRECTION_ASC = 'ASC';
Order.DIRECTION_DESC = 'DESC';

module.exports = Order;
