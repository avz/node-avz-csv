'use strict';

const assert = require('assert');
const Tokenizer = require('../../src/Tokenizer');
const TokenizerOptions = require('../../src/TokenizerOptions');

describe('Tokenizer', () => {
	const parse = (opts, string) => {
		const rows = [];
		var row = [];
		var endEmitted = false;

		const t = new Tokenizer(
			TokenizerOptions.from(opts),
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
		assert.deepStrictEqual(parse({}, 'hello,world,foo'), [['hello', 'world', 'foo']]);
		assert.deepStrictEqual(parse({delimiter: ';'}, 'hello;world;foo'), [['hello', 'world', 'foo']]);
	});

	it('quote', () => {
		assert.deepStrictEqual(parse({}, '"aaa,bbb",ccc'), [['aaa,bbb', 'ccc']]);
		assert.deepStrictEqual(parse({}, 'aaa","b"b"b,c"c"c'), [['aaa,bbb', 'ccc']]);
		assert.deepStrictEqual(parse({}, 'aaa,bb""b,ccc'), [['aaa', 'bbb', 'ccc']]);
		assert.deepStrictEqual(parse({}, 'aaa,"b""bb",ccc'), [['aaa', 'b"bb', 'ccc']]);

		assert.deepStrictEqual(parse({}, 'aaa,"hello\nworld"'), [['aaa', 'hello\nworld']]);
		assert.deepStrictEqual(parse({}, 'aaa,"hello"\n"world"'), [['aaa', 'hello'], ['world']]);
	});

	it('skipEmptyLines', () => {
		assert.deepStrictEqual(parse({skipEmptyLines: true}, '\n\n'), []);
		assert.deepStrictEqual(parse({skipEmptyLines: true}, '\n'), []);
		assert.deepStrictEqual(parse({skipEmptyLines: true}, ''), []);
		assert.deepStrictEqual(parse({skipEmptyLines: true}, ','), [['', '']]);
		assert.deepStrictEqual(parse({skipEmptyLines: true}, 'a,b\n\nc,d'), [['a', 'b'], ['c', 'd']]);
		assert.deepStrictEqual(parse({skipEmptyLines: true}, 'a,b\n\n\n\nc,d\n\n'), [['a', 'b'], ['c', 'd']]);
	});

	it('buffer size', () => {
		const opts = TokenizerOptions.from({delimiter: ',', quote: '"', initialBufferSize: 1});
		const rows = [];
		var row = [];

		const t = new Tokenizer(
			opts,
			(buf, start, end) => {
				assert(buf instanceof Buffer);
				row.push(buf.toString('utf-8', start, end));
			},
			() => {
				rows.push(row);
				row = [];
			},
			() => {
			}
		);

		t.write(Buffer.from('h'));
		t.write(Buffer.from('e'));
		t.write(Buffer.from('l'));
		t.write(Buffer.from('lo,'));
		t.write(Buffer.from('world'));
		t.write(Buffer.from(',foo'));
		t.end();

		assert.deepStrictEqual(rows, [['hello', 'world', 'foo']]);
	});

	it('multirows', () => {
		assert.deepStrictEqual(parse({}, 'aaa,bbb\nccc,ddd'), [['aaa', 'bbb'], ['ccc', 'ddd']]);
	});

	it('line ending', () => {
		assert.deepStrictEqual(parse({}, 'aaa\r\nbbb'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({}, 'aaa\rbbb\nhello'), [['aaa\rbbb'], ['hello']]);
		assert.deepStrictEqual(parse({}, 'aaa\r\r\r\nbbb'), [['aaa\r\r'], ['bbb']]);
		assert.deepStrictEqual(parse({}, 'aaa\nbbb'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({}, 'aaa\nbbb'), [['aaa'], ['bbb']]);
	});

	it('last row is empty', () => {
		assert.deepStrictEqual(parse({}, 'aaa'), [['aaa']]);
		assert.deepStrictEqual(parse({}, 'aaa\n'), [['aaa']]);
		assert.deepStrictEqual(parse({}, 'aaa\r\n'), [['aaa']]);
		assert.deepStrictEqual(parse({}, ',,'), [['', '', '']]);
	});

	it('empty fields', () => {
		assert.deepStrictEqual(parse({}, ''), []);
		assert.deepStrictEqual(parse({}, '\n'), [['']]);
		assert.deepStrictEqual(parse({}, ',,\n'), [['', '', '']]);
	});

	it('empty lines', () => {
		assert.deepStrictEqual(parse({}, 'aaa\n\nbbb'), [['aaa'], [''], ['bbb']]);
		assert.deepStrictEqual(parse({}, 'aaa\r\n\r\nbbb'), [['aaa'], [''], ['bbb']]);
	});

	it('ltrim', () => {
		assert.deepStrictEqual(parse({ltrim: true}, 'aaa\nbbb'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({ltrim: true}, ' aaa\nbbb'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({ltrim: true}, '  \taaa\n   bbb'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({ltrim: true}, '  \taaa \n   bbb '), [['aaa '], ['bbb ']]);
		assert.deepStrictEqual(parse({ltrim: true}, '  \t \n   bbb '), [[''], ['bbb ']]);
		assert.deepStrictEqual(parse({ltrim: true}, '  \t \n    '), [[''], ['']]);
		assert.deepStrictEqual(parse({ltrim: true}, '"aaa"\n"bbb"'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({ltrim: true}, ' "aaa"\n "bbb"'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({ltrim: true}, '" aaa"\n" bbb"'), [[' aaa'], [' bbb']]);
		assert.deepStrictEqual(parse({ltrim: true}, ' A"aaa"\n B"bbb"'), [['Aaaa'], ['Bbbb']]);
	});

	it('rtrim', () => {
		assert.deepStrictEqual(parse({rtrim: true}, 'aaa\nbbb'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({rtrim: true}, 'aaa \nbbb'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({rtrim: true}, 'aaa\t  \nbbb   '), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({rtrim: true}, ' aaa \t \n bbb   '), [[' aaa'], [' bbb']]);
		assert.deepStrictEqual(parse({rtrim: true}, '  \t \n bbb   '), [[''], [' bbb']]);
		assert.deepStrictEqual(parse({rtrim: true}, '  \t \n    '), [[''], ['']]);
		assert.deepStrictEqual(parse({rtrim: true}, '"aaa"\n"bbb"'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({rtrim: true}, '"aaa" \n"bbb" '), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({rtrim: true}, '"aaa "\n"bbb "'), [['aaa '], ['bbb ']]);
		assert.deepStrictEqual(parse({rtrim: true}, 'A"aaa"A \nB"bbb"B '), [['AaaaA'], ['BbbbB']]);
	});

	it('ltrim + rtrim', () => {
		assert.deepStrictEqual(parse({ltrim: true, rtrim: true}, 'aaa\nbbb'), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({ltrim: true, rtrim: true}, '   aaa  \n  bbb '), [['aaa'], ['bbb']]);
		assert.deepStrictEqual(parse({ltrim: true, rtrim: true}, '     \n  bbb '), [[''], ['bbb']]);
		assert.deepStrictEqual(parse({ltrim: true, rtrim: true}, '   " " \n  bbb '), [[' '], ['bbb']]);
	});
});
