'use strict';

const TokenizerOptions = require('./TokenizerOptions');
const OptionsValidator = require('./OptionsValidator');

class Options
{
	constructor()
	{
		if (arguments.length) {
			throw new Error('Use Options.from() to fill object with options');
		}

		this.detectTypes = false;
		this.detectDates = false;
		this.columns = 'first-line';
		this.delimiter = ',';
		this.quote = '"';
		this.ltrim = false;
		this.rtrim = false;
		this.trim = false;
		this.skipEmptyLines = false;
	}

	/**
	 *
	 * @param {object} object
	 * @returns {Options}
	 */
	static from(object)
	{
		const instance = new Options;

		for (const name in object) {
			if (!(name in instance)) {
				throw new Error('Unknown option: ' + name);
			}
		}

		const validator = new OptionsValidator;

		instance.detectTypes = validator.needBool(object, 'detectTypes', instance.detectTypes);
		instance.detectDates = validator.needBool(object, 'detectDates', instance.detectDates);

		instance.columns = validator.needCb(
			object,
			'columns',
			instance.columns,
			(cd) => {
				if (cd === 'first-line' || cd === null) {
					return true;
				}

				if (!(cd instanceof Array)) {
					return 'must be "first-line" or null or array of column names';
				}

				for (const cn of cd) {
					if (typeof(cn) !== 'string') {
						return 'column name must be string';
					}
				}

				return true;
			}
		);

		instance.delimiter = validator.needByte(object, 'delimiter', instance.delimiter);
		instance.quote = validator.needByte(object, 'quote', instance.quote);
		instance.trim = validator.needBool(object, 'trim', instance.trim);
		instance.ltrim = validator.needBool(object, 'ltrim', instance.ltrim);
		instance.rtrim = validator.needBool(object, 'rtrim', instance.rtrim);

		if (instance.trim && (instance.ltrim || instance.rtrim)) {
			throw new Error('Option `trim` cannot be combined with `ltrim` or `rtrim`');
		}

		instance.skipEmptyLines = validator.needBool(object, 'skipEmptyLines', instance.skipEmptyLines);

		return instance;
	}
}

module.exports = Options;
