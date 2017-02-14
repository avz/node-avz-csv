'use strict';

const assert = require('assert');
const OptionsValidator = require('../../src/OptionsValidator');

describe('OptionsValidator', () => {
	const v = new OptionsValidator;

	describe('needBool()', () => {
		it('valid', () => {
			assert.strictEqual(v.needBool({a: true}, 'a', null), true);
			assert.strictEqual(v.needBool({a: false}, 'a', null), false);

			assert.strictEqual(v.needBool({}, 'a', true), true);
		});

		it('invalid', () => {
			assert.throws(
				() => v.needBool({a: 10}, 'a', 1),
				/Option `a` must be boolean/
			);

			assert.throws(
				() => v.needBool({a: null}, 'a', 1),
				/Option `a` must be boolean/
			);
		});
	});

	describe('needNumber()', () => {
		it('valid', () => {
			assert.strictEqual(v.needNumber({a: 10}, 'a', null), 10);
			assert.strictEqual(v.needNumber({}, 'a', 10), 10);
		});

		it('invalid', () => {
			assert.throws(
				() => v.needNumber({a: true}, 'a', 1),
				/Option `a` must be number/
			);
		});
	});

	describe('needByte()', () => {
		it('valid', () => {
			assert.strictEqual(v.needByte({a: 'W'}, 'a', null), 'W');
			assert.strictEqual(v.needByte({}, 'a', 'W'), 'W');
		});

		it('invalid', () => {
			assert.throws(
				() => v.needByte({a: 'Ы'}, 'a', 1),
				/Option `a` must be one-byte string/
			);
		});
	});

	describe('needCb()', () => {
		it('valid', () => {
			assert.strictEqual(v.needCb({a: 'W'}, 'a', 1, v => true), 'W');
			assert.strictEqual(v.needCb({}, 'a', 'W', v => true), 'W');
		});

		it('invalid', () => {
			assert.throws(
				() => v.needCb({a: 'Ы'}, 'a', 1, v => 'error message'),
				/Error: Option `a` is invalid: error message/
			);
		});
	});
});
