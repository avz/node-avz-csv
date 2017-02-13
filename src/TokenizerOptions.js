'use strict';

class TokenizerOptions
{
	constructor(delimiterCode, quoteCode)
	{
		this.delimiterCode = delimiterCode;
		this.quoteCode = quoteCode;
		this.initialBufferSize = 2 * 64 * 1024; // 2 * Writable.highWaterMark
	}
}

module.exports = TokenizerOptions;
