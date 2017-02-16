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

		this.firstQuotePosition = -1;
		this.lastQuotePosition = -1;

		this.options = options;

		this.needTriming = this.options.ltrim || this.options.rtrim;

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

					this.lastQuotePosition = this.valueBufSize;
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
				this.firstQuotePosition = -1;

				continue;
			}

			this.lastCharIsCR = false;

			if (chr === delimiterCode) {
				this.endFieldValue();
				this.firstQuotePosition = -1;

			} else if (chr === quoteCode) {
				if (this.firstQuotePosition === -1) {
					this.firstQuotePosition = this.valueBufSize;
				}

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
		if (this.needTriming) {
			this.onFieldWithTriming(this.valueBuf, 0, this.valueBufSize);
		} else {
			this.onField(this.valueBuf, 0, this.valueBufSize);
		}

		this.valueBufSize = 0;
	}

	/**
	 * Сделать все *trim для значения, после чего передать результат в onField()
	 * @param {Buffer} buf
	 * @param {number} start
	 * @param {number} end
	 * @returns {undefined}
	 */
	onFieldWithTriming(buf, start, end)
	{
		var trimmedStart = start;
		var trimmedEnd = end;

		var i;

		if (this.options.ltrim) {
			const scanEnd = this.firstQuotePosition === -1 ? trimmedEnd : this.firstQuotePosition;

			for (i = start; i < scanEnd; i++) {
				if (!Tokenizer.isSpace(buf[i])) {
					break;
				}
			}

			trimmedStart = i;
		}

		if (this.options.rtrim) {
			const scanStart = this.firstQuotePosition === -1 ? trimmedStart : this.lastQuotePosition;

			for (i = end - 1; i >= scanStart; i--) {
				if (!Tokenizer.isSpace(buf[i])) {
					break;
				}
			}

			trimmedEnd = i + 1;
		}

		this.onField(buf, trimmedStart, trimmedEnd);
	}

	/**
	 * @private
	 * @param {number} chr
	 * @returns {boolean}
	 */
	static isSpace(chr)
	{
		return chr === 0x20 || chr === 0x09;
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
