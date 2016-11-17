'use strict';

class DataType
{
	constructor()
	{
		throw new Error('This is a static class');
	}
}

DataType.NUMBER = 'NUMBER';
DataType.STRING = 'STRING';
DataType.BOOL = 'BOOL';
DataType.DATE = 'BOOL';
DataType.MIXED = 'MIXED';

module.exports = DataType;
