'use strict';

const assert = require('assert');
const Tokenizer = require('../../src/Tokenizer');
const TokenizerOptions = require('../../src/TokenizerOptions');

describe('Tokenizer', () => {
	const parse = (delimiter, quote, string) => {
		const rows = [];
		var row = [];
		var endEmitted = false;

		const t = new Tokenizer(
			new TokenizerOptions(delimiter.charCodeAt(0), quote.charCodeAt(0)),
			(buf, start, end) => {
				assert(buf instanceof Buffer);
				row.push(buf.toString('utf-8', start, end));
			},
			() => {
				rows.push(row);
				row = [];
			},
			() => {
				endEmitted = true;
			}
		);

		t.write(Buffer.from(string));
		t.end();

		assert.strictEqual(endEmitted, true);

		return rows;
	};

	it('delimiter', () => {
		assert.deepStrictEqual(parse(',', '"', 'hello,world,foo'), [['hello', 'world', 'foo']]);
		assert.deepStrictEqual(parse(';', '"', 'hello;world;foo'), [['hello', 'world', 'foo']]);
	});

	it('quote', () => {
		assert.deepStrictEqual(parse(',', '"', '"aaa,bbb",ccc'), [['aaa,bbb', 'ccc']]);
		assert.deepStrictEqual(parse(',', '"', 'aaa","b"b"b,c"c"c'), [['aaa,bbb', 'ccc']]);
		assert.deepStrictEqual(parse(',', '"', 'aaa,bb""b,ccc'), [['aaa', 'bbb', 'ccc']]);
		assert.deepStrictEqual(parse(',', '"', 'aaa,"b""bb",ccc'), [['aaa', 'b"bb', 'ccc']]);
	});
});
