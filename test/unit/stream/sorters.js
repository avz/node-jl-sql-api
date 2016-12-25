'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const SorterInMemory = require('../../../src/stream/SorterInMemory');
const SorterExternal = require('../../../src/stream/SorterExternal');
const SortOptions = require('../../../src/SortOptions');
const Order = require('../../../src/Order');

for (const sorterCtor of [SorterInMemory, SorterExternal]) {
	describe(sorterCtor.name, () => {
		const dataRoot = path.join(__dirname, 'sort');

		const createValueFunction = (field) => {
			const cb = (row) => {
				return row[field];
			};

			return cb;
		};

		for (const f of fs.readdirSync(dataRoot)) {
			const data = require(path.join(__dirname, 'sort', f));

			for (const testcaseName in data.cases) {
				const testcase = data.cases[testcaseName];
				const orders = [];

				for (const [field, direction, type] of testcase.orders) {
					orders.push(new Order(createValueFunction(field), direction, type));
				}

				it(f + ' / ' + testcaseName, done => {
					const sorter = new sorterCtor(orders, new SortOptions);
					let sorted = [];

					sorter.on('end', () => {
						assert.deepStrictEqual(sorted, testcase.expected);
						done();
					});

					sorter.on('data', (chunk) => {
						sorted = sorted.concat(chunk);
					});

					sorter.end(data.input);
				});
			}
		}
	});
}
