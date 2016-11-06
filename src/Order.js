class Order
{
	constructor(valueFunction, direction, collation = null)
	{
		this.valueFunction = valueFunction;
		this.direction = direction;
		this.collation = collation;
	}
}

Order.DIRECTION_ASC = 'ASC';
Order.DIRECTION_DESC = 'DESC';

module.exports = Order;
