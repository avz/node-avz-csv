'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const StreamParser = require('../../').StreamParser;

describe('csv-spectrum tests', () => {
	const baseDir = path.join(__dirname, 'datasets');
	const cases = fs.readdirSync(path.join(baseDir, 'csvs'));

	const parse = (opts, input) => {
		const p = new StreamParser(opts);

		const out = [];

		p.on('data', row => {
			out.push(row);
		});

		p.end(Buffer.from(input));

		return out;
	};

	for (const name of cases) {
		const csvData = fs.readFileSync(path.join(baseDir, 'csvs', name));
		const expectedResult = require(path.join(baseDir, 'json', path.parse(name).name + '.json'));

		it(name, () => {
			const result = parse({}, csvData);

			assert.deepStrictEqual(result, expectedResult);
		});
	}
});
