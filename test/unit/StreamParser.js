'use strict';

const assert = require('assert');
const StreamParser = require('../../src/StreamParser');

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

	it('skipEmptyLines', () => {
		assert.deepStrictEqual(
			parse({columns: null, skipEmptyLines: true}, 'hello,world\n\n\nfoo,bar\n,\n\n'),
			[['hello', 'world'], ['foo', 'bar'], ['', '']]
		);

		assert.deepStrictEqual(
			parse({columns: null, skipEmptyLines: false}, 'hello,world\n\n\nfoo,bar'),
			[['hello', 'world'], [''], [''], ['foo', 'bar']]
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

	it('detectNumbers', () => {
		assert.deepStrictEqual(
			parse({columns: null, detectNumbers: true}, 'hello,123\n321,bar'),
			[['hello', 123], [321, 'bar']]
		);

		assert.deepStrictEqual(
			parse({columns: null, detectNumbers: true}, 'hello,123hello\n321,bar'),
			[['hello', '123hello'], [321, 'bar']]
		);
	});

	it('detectDates', () => {
		const d = parse({columns: null, detectDates: true}, '2015-01-01')[0][0];

		assert.strictEqual(d.getTime(), (new Date('2015-01-01')).getTime());
	});
});
