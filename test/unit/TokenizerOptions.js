'use strict';

const assert = require('assert');
const TokenizerOptions = require('../../src/TokenizerOptions');

describe('TokenizerOptions', () => {
	describe('constructor with arguments', () => {
		assert.throws(
			() => {
				return new TokenizerOptions({hello: 10});
			},
			/Use TokenizerOptions\.from\(\) to fill object with options/
		);
	});

	describe('invalid', () => {
		it('unknown options', () => {
			assert.throws(() => TokenizerOptions.from({unk: true}), /Unknown option: unk/);
		});
	});
});
