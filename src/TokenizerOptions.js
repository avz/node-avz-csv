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
	}

	/**
	 * @constructs
	 * @param {object} options
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

		return instance;
	}
}

module.exports = TokenizerOptions;
