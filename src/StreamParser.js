'use strict';

const Transform = require('stream').Transform;
const Tokenizer = require('./Tokenizer');
const TokenizerOptions = require('./TokenizerOptions');
const RowConstructor = require('./RowConstructor');
const assert = require('assert');

class StreamParser extends Transform
{
	/**
	 *
	 * @param {Options} options
	 * @returns {Parser}
	 */
	constructor(options)
	{
		super({objectMode: true});

		this.rowNumber = 0;

		this.currentRow = [];
		this.columns = [];
		this.rowConstructor = null;

		if (options.columns instanceof Array) {
			this.columns = options.columns;
			this.initRowConstructor();
		}

		/**
		 * @type {Options}
		 */
		this.options = options;

		this.tokenizer = new Tokenizer(
			TokenizerOptions.from({
				delimiter: this.options.delimiter,
				quote: this.options.quote
			}),
			this.onTokenizerValue.bind(this),
			this.onTokenizerRowEnd.bind(this),
			this.onTokenizerEnd.bind(this)
		);
	}

	onTokenizerValue(buf, start, end)
	{
		this.currentRow.push(buf.toString('utf-8', start, end));
	}

	onTokenizerRowEnd()
	{
		this.onRow(this.currentRow);

		this.currentRow = [];
	}

	onTokenizerEnd()
	{
		this.push(null);
	}

	onRow(row)
	{
		this.rowNumber++;

		if (this.rowNumber === 1 && this.options.columns === 'first-line') {
			this.columns = row;
			this.initRowConstructor();

			return;
		}

		if (this.rowConstructor) {
			this.push(this.rowConstructor.createFromArray(row));
		} else {
			this.push(row);
		}
	}

	initRowConstructor()
	{
		this.rowConstructor = new RowConstructor(this.columns);
	}

	_transform(data, enc, cb)
	{
		assert(data instanceof Buffer, 'StreamParser.prototype.write() expect Buffer as argument');

		this.tokenizer.write(data);

		cb();
	}

	_flush(cb)
	{
		this.tokenizer.end();

		cb();
	}
}

module.exports = StreamParser;
