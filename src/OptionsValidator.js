'use strict';

class OptionsValidator
{
	_validate(name, value, type)
	{
		if (type instanceof Function) {
			const res = type(value);

			if (res !== true) {
				throw new Error(`Option \`${name}\` is invalid: ${res}`);
			}
		} else if (typeof(value) !== type) {
			throw new Error(`Option \`${name}\` must be ${type}`);
		}
	}

	_needType(obj, name, defaultValue, type)
	{
		const value = obj[name];

		if (value === undefined) {
			return defaultValue;
		}

		this._validate(name, value, type);

		return value;
	}

	needBool(obj, name, defaultValue)
	{
		return this._needType(obj, name, defaultValue, 'boolean');
	}

	needCb(obj, name, defaultValue, cb)
	{
		return this._needType(obj, name, defaultValue, cb);
	}

	needByte(obj, name, defaultValue)
	{
		const value = obj[name];

		if (value === undefined) {
			return defaultValue;
		}

		this._validate(name, value, 'string');

		if (Buffer.byteLength(value) !== 1) {
			throw new Error(`Option \`${name}\` must be one-byte string`);
		}

		return value;
	}

	needNumber(obj, name, defaultValue)
	{
		return this._needType(obj, name, defaultValue, 'number');
	}
}

module.exports = OptionsValidator;
