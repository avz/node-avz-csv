'use strict';

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
		this.encoding = null;
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

		const _validate = (object, name, type) => {
			const v = object[name];

			if (v === undefined || v === instance[name]) {
				return instance[name];
			}

			if (type instanceof Function) {
				const res = type(v);

				if (res !== true) {
					throw new Error(`Options \`${name}\` is invalid: ${res}`);
				}
			} else if (typeof(v) !== type) {
				throw new Error(`Options \`${name}\` must be ${type}`);
			}

			return v;
		};

		instance.detectTypes = _validate(object, 'detectTypes', 'boolean');
		instance.detectDates = _validate(object, 'detectDates', 'boolean');

		instance.columns = _validate(
			object,
			'columns',
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

		instance.delimiter = _validate(object, 'delimiter', 'string');
		instance.quote = _validate(object, 'quote', 'string');

		instance.trim = _validate(object, 'trim', 'boolean');
		instance.ltrim = _validate(object, 'ltrim', 'boolean');
		instance.rtrim = _validate(object, 'rtrim', 'boolean');

		if (instance.trim && (instance.ltrim || instance.rtrim)) {
			throw new Error('Option `trim` cannot be combined with `ltrim` or `rtrim`');
		}

		instance.skipEmptyLines = _validate(object, 'skipEmptyLines', 'boolean');

		instance.encoding = _validate(object, 'encoding', 'string');

		return instance;
	}
}

module.exports = Options;
