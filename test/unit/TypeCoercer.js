'use strict';

const assert = require('assert');
const TypeCoercer = require('../../src/TypeCoercer');

describe('TypeCoercer', () => {
	describe('numbers', () => {
		const c = new TypeCoercer(false);

		it('int', () => {
			assert.strictEqual(c.coerce('0'), 0);
			assert.strictEqual(c.coerce('1234'), 1234);
			assert.strictEqual(c.coerce('-1234'), -1234);
			assert.strictEqual(c.coerce('+1234'), 1234);
		});

		it('float', () => {
			assert.strictEqual(c.coerce('1234.123'), 1234.123);
			assert.strictEqual(c.coerce('-1234.123'), -1234.123);
			assert.strictEqual(c.coerce('+1234.123'), 1234.123);
			assert.strictEqual(c.coerce('1e6'), 1e6);
			assert.strictEqual(c.coerce('1E6'), 1e6);
			assert.strictEqual(c.coerce('1e-6'), 1e-6);
			assert.strictEqual(c.coerce('-1.2e-3'), -1.2e-3);
		});

		it('invalid', () => {
			assert.strictEqual(c.coerce(''), '');
			assert.strictEqual(c.coerce(' 123'), ' 123');
			assert.strictEqual(c.coerce('123 '), '123 ');
			assert.strictEqual(c.coerce('1234a'), '1234a');
			assert.strictEqual(c.coerce('123e-a1'), '123e-a1');

			assert.strictEqual(c.coerce('123e1234567'), '123e1234567');
		});
	});

	describe('dates', () => {
		const c = new TypeCoercer(true);

		it('valid', () => {
			assert.strictEqual(c.coerce('2016-01-01').getTime(), (new Date('2016-01-01')).getTime());
			assert.strictEqual(c.coerce('2016-01-01 01:01:01').getTime(), (new Date('2016-01-01 01:01:01')).getTime());
		});

		it('invalid', () => {
			assert.strictEqual(c.coerce('123'), 123);
			assert.strictEqual(c.coerce('2016-01-01 01:01:01 hello'), '2016-01-01 01:01:01 hello');
			assert.strictEqual(c.coerce('Thu'), 'Thu');
		});
	});
});
