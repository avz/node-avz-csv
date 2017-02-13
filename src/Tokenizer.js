'use strict';

const assert = require('assert');

class Tokenizer
{
	constructor(options, onField, onRowEnd, onEnd)
	{
		this.delimiterCode = options.delimiterCode;
		this.quoteCode = options.quoteCode;

		this.quoted = false;
		this.lastCharIsQuote = false;

		this.valueBuf = Buffer.allocUnsafe(options.initialBufferSize);
		this.valueBufSize = 0;

		this.linesCount = 0;
		this.fieldsCount = 0;

		this.onField = onField;
		this.onRowEnd = onRowEnd;
		this.onEnd = onEnd;
	}

	alloc(additionalSize)
	{
		const newBuf = Buffer.allocUnsafe(this.valueBuf.length + additionalSize);

		if (this.valueBufSize) {
			this.valueBuf.copy(newBuf, 0, 0, this.valueBufSize);
		}

		this.valueBuf = newBuf;
	}

	write(buf)
	{
		if (this.valueBuf.length - this.valueBufSize - 1 < buf.length) {
			this.alloc(buf.length);
		}

		const quoteCode = this.quoteCode;
		const delimiterCode = this.delimiterCode;
		const value = this.valueBuf;

		for (var i = 0; i < buf.length; i++) {
			const chr = buf[i];

			if (this.quoted) {
				if (this.lastCharIsQuote) {
					this.lastCharIsQuote = false;

					if (chr === quoteCode) {
						value[this.valueBufSize++] = chr;

						continue;
					} else if (chr === delimiterCode) {
						this.endFieldValue();

						this.quoted = false;

						continue;
					} else {
						value[this.valueBufSize++] = chr;

						this.quoted = false;
					}
				} else if (chr === quoteCode) {
					this.lastCharIsQuote = true;
				} else {
					value[this.valueBufSize++] = chr;
				}
			} else {
				if (chr === delimiterCode) {
					this.endFieldValue();
				} else if (chr === quoteCode) {
					this.quoted = true;
				} else if (chr === 0x0d || chr === 0x0a) {
					this.endRow();
				} else {
					value[this.valueBufSize++] = chr;
				}
			}
		}
	}

	end()
	{
		this.endRow();

		console.error(this.fieldsCount, this.linesCount);

		this.onEnd();
	}

	endFieldValue()
	{
		this.onField(this.valueBuf, 0, this.valueBufSize);

		this.valueBufSize = 0;
	}

	endRow()
	{
		this.endFieldValue();
		this.linesCount++;

		this.onRowEnd();
	}
}

module.exports = Tokenizer;
