'use strict';

const OptionsValidator = require('./OptionsValidator');

class TokenizerOptions
{
	/**
	 *
	 * @returns {TokenizerOptions}
	 */
	constructor()
	{
		if (arguments.length) {
			throw new Error('Use TokenizerOptions.from() to fill object with options');
		}

		this.delimiter = ',';
		this.quote = '"';
		this.initialBufferSize = 2 * 64 * 1024;
		this.ltrim = false;
		this.rtrim = false;
		this.skipEmptyLines = false;
	}

	/**
	 * @constructs
	 * @param {options} options
	 * @returns {TokenizerOptions}
	 */
	static from(options)
	{
		const instance = new TokenizerOptions;

		for (const name in options) {
			if (!(name in instance)) {
				throw new Error('Unknown option: ' + name);
			}
		}

		const validator = new OptionsValidator;

		instance.delimiter = validator.needByte(options, 'delimiter', instance.delimiter);
		instance.quote = validator.needByte(options, 'quote', instance.quote);
		instance.initialBufferSize = validator.needNumber(options, 'initialBufferSize', instance.initialBufferSize);
		instance.ltrim = validator.needBool(options, 'ltrim', instance.ltrim);
		instance.rtrim = validator.needBool(options, 'rtrim', instance.rtrim);
		instance.skipEmptyLines = validator.needBool(options, 'skipEmptyLines', instance.skipEmptyLines);

		return instance;
	}
}

module.exports = TokenizerOptions;
