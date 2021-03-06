'use strict';

const assert = require('assert');
const Options = require('../../src/Options');

describe('Options', () => {
	describe('constructor with arguments', () => {
		assert.throws(
			() => {
				return new Options({hello: 10});
			},
			/Use Options\.from\(\) to fill object with options/
		);
	});

	describe('from()', () => {
		const values = {
			detectNumbers: [false, true],
			detectDates: [false, true],
			columns: ['first-line', ['a', 'b', 'c'], null],
			batch: [false, true],
			delimiter: [',', ';', '\t'],
			quote: ['"', "'"],
			ltrim: [false, true],
			rtrim: [false, true]
		};

		for (const name in values) {
			it(name, () => {
				const cases = values[name];
				const defaultValue = cases[0];

				assert.strictEqual(Options.from({})[name], defaultValue, 'default value');

				for (const v of cases) {
					assert.deepStrictEqual(
						Options.from({[name]: v})[name],
						v
					);
				}
			});
		}

		describe('invalid', () => {
			it('unknown options', () => {
				assert.throws(() => Options.from({unk: true}), /Unknown option: unk/);
			});

			describe('columns', () => {
				it('wrong type', () => {
					assert.throws(
						() => Options.from({columns: true}),
						/Option `columns` is invalid: must be "first-line" or null or array of column names/
					);
				});

				it('name not string', () => {
					assert.throws(
						() => Options.from({columns: ["a", true]}),
						/Option `columns` is invalid: column name must be string/
					);
				});
			});
		});
	});
});
