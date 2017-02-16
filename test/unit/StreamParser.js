'use strict';

const assert = require('assert');
const StreamParser = require('../../src/StreamParser');
const Options = require('../../src/Options');
const NotImplemented = require('../../src/error/NotImplemented');

describe('StreamParser', () => {
	const parse = (opts, input) => {
		const p = new StreamParser(opts);

		const out = [];

		p.on('data', row => {
			out.push(row);
		});

		if (input instanceof Array) {
			for (const inp of input) {
				p.write(Buffer.from(inp));
			}

			p.end();
		} else {
			p.end(Buffer.from(input));
		}

		return out;
	};

	it('delimiter', () => {
		assert.deepStrictEqual(
			parse({columns: null}, 'hello,world\nfoo,bar'),
			[['hello', 'world'], ['foo', 'bar']]
		);

		assert.deepStrictEqual(
			parse({columns: null, delimiter: ';'}, 'hello;world\nfoo;bar'),
			[['hello', 'world'], ['foo', 'bar']]
		);
	});

	it('quote', () => {
		assert.deepStrictEqual(
			parse({columns: null}, 'hello,"world"\n"foo",bar'),
			[['hello', 'world'], ['foo', 'bar']]
		);

		assert.deepStrictEqual(
			parse({columns: null, quote: "'"}, "hello,'world'\n'foo',bar"),
			[['hello', 'world'], ['foo', 'bar']]
		);
	});

	describe('columns', () => {
		it('default is first-line', () => {
			assert.deepStrictEqual(
				parse({columns: 'first-line'}, 'hello,world\nfoo,bar\ndead,beef'),
				[{hello: 'foo', world: 'bar'}, {hello: 'dead', world: 'beef'}]
			);
		});

		it('`null`', () => {
			assert.deepStrictEqual(
				parse({columns: null}, 'hello,world\nfoo,bar'),
				[['hello', 'world'], ['foo', 'bar']]
			);
		});

		it('`"first-line"`', () => {
			assert.deepStrictEqual(
				parse({columns: 'first-line'}, 'hello,world\nfoo,bar\ndead,beef'),
				[{hello: 'foo', world: 'bar'}, {hello: 'dead', world: 'beef'}]
			);
		});

		it('user specified', () => {
			assert.deepStrictEqual(
				parse({columns: ['aaa', 'bbb']}, 'hello,world\nfoo,bar'),
				[{aaa: 'hello', bbb: 'world'}, {aaa: 'foo', bbb: 'bar'}]
			);
		});
	});

	describe('not implemented options', () => {
		const notImplemented = ['detectDates', 'detectTypes'];

		for (const opt of notImplemented) {
			it(opt, () => {
				assert.throws(
					() => new StreamParser(Options.from({[opt]: true})),
					NotImplemented
				);
			});
		}
	});

	it('batch', () => {
		assert.deepStrictEqual(
			parse({columns: null, batch: true}, 'hello,world\nfoo,bar'),
			[[['hello', 'world']], [['foo', 'bar']]]
		);

		assert.deepStrictEqual(
			parse({columns: null, batch: true}, ['hello,world\nfoo,bar\naaa,bbb']),
			[[['hello', 'world'], ['foo', 'bar']], [['aaa', 'bbb']]]
		);

		assert.deepStrictEqual(
			parse({columns: null, batch: true}, ['hello,world\nfoo,bar\naaa,bbb\n']),
			[[['hello', 'world'], ['foo', 'bar'], ['aaa', 'bbb']]]
		);
	});
});
