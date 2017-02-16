'use strict';

class OptionsValidator
{
	/**
	 *
	 * @param {string} name
	 * @param {*} value
	 * @param {string|Function} type
	 * @returns {undefined}
	 */
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

	/**
	 *
	 * @param {*} obj
	 * @param {string} name
	 * @param {*} defaultValue
	 * @param {string|Function} type
	 * @returns {*}
	 */
	_needType(obj, name, defaultValue, type)
	{
		const value = obj[name];

		if (value === undefined) {
			return defaultValue;
		}

		this._validate(name, value, type);

		return value;
	}

	/**
	 * @param {object} obj
	 * @param {string} name
	 * @param {*} defaultValue
	 * @returns {boolean}
	 */
	needBool(obj, name, defaultValue)
	{
		return this._needType(obj, name, defaultValue, 'boolean');
	}

	/**
	 * @param {object} obj
	 * @param {string} name
	 * @param {*} defaultValue
	 * @param {Function} cb
	 * @returns {boolean}
	 */
	needCb(obj, name, defaultValue, cb)
	{
		return this._needType(obj, name, defaultValue, cb);
	}

	/**
	 * @param {object} obj
	 * @param {string} name
	 * @param {*} defaultValue
	 * @returns {string}
	 */
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

	/**
	 * @param {object} obj
	 * @param {string} name
	 * @param {*} defaultValue
	 * @returns {number}
	 */
	needNumber(obj, name, defaultValue)
	{
		return this._needType(obj, name, defaultValue, 'number');
	}
}

module.exports = OptionsValidator;
