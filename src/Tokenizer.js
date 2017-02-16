'use strict';

class Tokenizer
{
	/**
	 *
	 * @param {TokenizerOptions} options
	 * @param {Function} onField
	 * @param {Function} onRowEnd
	 * @param {Function} onEnd
	 * @returns {Tokenizer}
	 */
	constructor(options, onField, onRowEnd, onEnd)
	{
		this.delimiterCode = options.delimiter.charCodeAt(0);
		this.quoteCode = options.quote.charCodeAt(0);

		this.quoted = false;
		this.lastCharIsQuote = false;
		this.lastCharIsCR = false;

		this.valueBuf = Buffer.allocUnsafe(options.initialBufferSize);
		this.valueBufSize = 0;

		this.linesCount = 0;
		this.fieldsCount = 0;

		this.onField = onField;
		this.onRowEnd = onRowEnd;
		this.onEnd = onEnd;
	}

	/**
	 *
	 * @param {number} additionalSize number of bytes to *add* to buffer size
	 * @returns {undefined}
	 */
	alloc(additionalSize)
	{
		const newBuf = Buffer.allocUnsafe(this.valueBuf.length + additionalSize);

		if (this.valueBufSize) {
			this.valueBuf.copy(newBuf, 0, 0, this.valueBufSize);
		}

		this.valueBuf = newBuf;
	}

	/**
	 *
	 * @param {Buffer} buf
	 * @returns {undefined}
	 */
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
					}

					this.quoted = false;
					// there is no `continue`!
				} else if (chr === quoteCode) {
					this.lastCharIsQuote = true;

					continue;
				} else {
					value[this.valueBufSize++] = chr;

					continue;
				}
			}

			if (chr === 0x0a) {
				if (this.lastCharIsCR) {
					// remove CR from result string
					this.valueBufSize--;

					this.lastCharIsCR = false;
				}

				this.endRow();

				continue;
			}

			this.lastCharIsCR = false;

			if (chr === delimiterCode) {
				this.endFieldValue();
			} else if (chr === quoteCode) {
				this.quoted = true;
			} else if (chr === 0x0d) {
				this.lastCharIsCR = true;

				value[this.valueBufSize++] = chr;
			} else {
				value[this.valueBufSize++] = chr;
			}
		}
	}

	/**
	 *
	 * @returns {undefined}
	 */
	end()
	{
		if (this.valueBufSize) {
			this.endRow();
		}

		this.onEnd();
	}

	/**
	 *
	 * @returns {undefined}
	 */
	endFieldValue()
	{
		this.onField(this.valueBuf, 0, this.valueBufSize);

		this.valueBufSize = 0;
	}

	/**
	 *
	 * @returns {undefined}
	 */
	endRow()
	{
		this.endFieldValue();
		this.linesCount++;

		this.onRowEnd();
	}
}

module.exports = Tokenizer;
