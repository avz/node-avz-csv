'use strict';

const OptionsValidator = require('./OptionsValidator');

class Options
{
	/**
	 * @returns {Options}
	 */
	constructor()
	{
		if (arguments.length) {
			throw new Error('Use Options.from() to fill object with options');
		}

		this.detectTypes = false;
		this.detectDates = false;
		this.columns = 'first-line';
		this.delimiter = ',';
		this.batch = false;
		this.quote = '"';
		this.ltrim = false;
		this.rtrim = false;
		this.trim = false;
		this.skipEmptyLines = false;
	}

	/**
	 * @param {object} object key-value set of options
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

		instance.batch = validator.needBool(object, 'batch', instance.batch);
		instance.delimiter = validator.needByte(object, 'delimiter', instance.delimiter);
		instance.quote = validator.needByte(object, 'quote', instance.quote);
		instance.trim = validator.needBool(object, 'trim', instance.trim);
		instance.ltrim = validator.needBool(object, 'ltrim', instance.ltrim);
		instance.rtrim = validator.needBool(object, 'rtrim', instance.rtrim);

		return instance;
	}
}

module.exports = Options;
