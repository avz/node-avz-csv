'use strict';

const assert = require('assert');
const Options = require('../../src/Options');

describe('Options', () => {
	describe('from()', () => {
		const values = {
			detectTypes: [false, true],
			detectDates: [false, true],
			columns: ['first-line', ['a', 'b', 'c'], null],
			delimiter: [',', ';', '\t'],
			quote: ['"', "'"],
			ltrim: [false, true],
			rtrim: [false, true],
			trim: [false, true],
			skipEmptyLines: [false, true],
			encoding: [null, 'cp1251']
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

			it('wrong type', () => {
				assert.throws(
					() => Options.from({delimiter: true}),
					/Options `delimiter` must be string/
				);
			});

			describe('columns', () => {
				it('wrong type', () => {
					assert.throws(
						() => Options.from({columns: true}),
						/Options `columns` is invalid: must be "first-line" or null or array of column names/
					);
				});

				it('name not string', () => {
					assert.throws(
						() => Options.from({columns: ["a", true]}),
						/Options `columns` is invalid: column name must be string/
					);
				});
			});

			it('trim in combination of ltrim or rtrim', () => {
				assert.throws(
					() => Options.from({trim: true, ltrim: true}),
					/Option `trim` cannot be combined with `ltrim` or `rtrim`/
				);

				assert.throws(
					() => Options.from({rtrim: true, trim: true}),
					/Option `trim` cannot be combined with `ltrim` or `rtrim`/
				);

				assert.doesNotThrow(
					() => Options.from({rtrim: false, trim: false})
				);
			});
		});
	});
});
