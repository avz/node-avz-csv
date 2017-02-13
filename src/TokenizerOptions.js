'use strict';

class TokenizerOptions
{
	constructor(delimiterCode, quoteCode, internalBufferSize = 2 * 64 * 1024)
	{
		this.delimiterCode = delimiterCode;
		this.quoteCode = quoteCode;
		this.initialBufferSize = internalBufferSize;
	}
}

module.exports = TokenizerOptions;
