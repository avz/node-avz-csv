'use strict';

const assert = require('assert');
const RowConstructor = require('../../src/RowConstructor');

describe('RowConstructor', () => {
	it('duplicate columns', () => {
		assert.throws(
			() => new RowConstructor(['hello', 'world', 'hello']),
			/Duplicate column name: hello/
		);
	});

	it('too many fields', () => {
		const rc = new RowConstructor(['first', 'second']);

		assert.deepStrictEqual(rc.createFromArray(['1', '2', '3']), {first: '1', second: '2'});
	});

	it('too few fields', () => {
		const rc = new RowConstructor(['first', 'second']);

		assert.deepStrictEqual(rc.createFromArray(['1']), {first: '1', second: undefined});
	});

	it('expected fields count', () => {
		const rc = new RowConstructor(['first', 'second']);

		assert.deepStrictEqual(rc.createFromArray(['1', '2']), {first: '1', second: '2'});
	});
});
