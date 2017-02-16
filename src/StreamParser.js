'use strict';

const Transform = require('stream').Transform;
const Tokenizer = require('./Tokenizer');
const TokenizerOptions = require('./TokenizerOptions');
const RowConstructor = require('./RowConstructor');
const Options = require('./Options');
const NotImplemented = require('./error/NotImplemented');
const assert = require('assert');

class StreamParser extends Transform
{
	/**
	 *
	 * @param {object|Options} opts
	 * @returns {Parser}
	 */
	constructor(opts)
	{
		const options = Options.from(opts);

		if (options.detectDates) {
			throw NotImplemented('Options.detectDates');
		}

		if (options.detectTypes) {
			throw NotImplemented('Options.detectTypes');
		}

		if (options.ltrim) {
			throw NotImplemented('Options.ltrim');
		}

		if (options.rtrim) {
			throw NotImplemented('Options.ltrim');
		}

		if (options.trim) {
			throw NotImplemented('Options.trim');
		}

		if (options.skipEmptyLines) {
			throw NotImplemented('Options.skipEmptyLines');
		}

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

	/**
	 *
	 * @param {Buffer} buf
	 * @param {number} start
	 * @param {number} end
	 * @returns {undefined}
	 */
	onTokenizerValue(buf, start, end)
	{
		this.currentRow.push(buf.toString('utf-8', start, end));
	}

	/**
	 *
	 * @returns {undefined}
	 */
	onTokenizerRowEnd()
	{
		this.onRow(this.currentRow);

		this.currentRow = [];
	}

	/**
	 *
	 * @returns {undefined}
	 */
	onTokenizerEnd()
	{
		this.push(null);
	}

	/**
	 *
	 * @param {*[]} row
	 * @returns {undefined}
	 */
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

	/**
	 *
	 * @returns {undefined}
	 */
	initRowConstructor()
	{
		this.rowConstructor = new RowConstructor(this.columns);
	}

	/**
	 *
	 * @param {string|Buffer} data
	 * @param {string} enc
	 * @param {Function} cb
	 * @returns {undefined}
	 */
	_transform(data, enc, cb)
	{
		assert(data instanceof Buffer, 'StreamParser.prototype.write() expect Buffer as argument');

		this.tokenizer.write(data);

		cb();
	}

	/**
	 *
	 * @param {Function} cb
	 * @returns {undefined}
	 */
	_flush(cb)
	{
		this.tokenizer.end();

		cb();
	}
}

module.exports = StreamParser;
