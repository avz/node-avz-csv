'use strict';

class TypeCoercer
{
	/**
	 *
	 * @param {boolean} detectDates
	 * @returns {TypeCoercer}
	 */
	constructor(detectDates)
	{
		this.detectDates = !!detectDates;
		this.numberRegexp = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
	}

	/**
	 *
	 * @param {string} string
	 * @returns {string|number|Date}
	 */
	coerce(string)
	{
		if (this.numberRegexp.test(string)) {
			const float = parseFloat(string);

			if (isNaN(float) || !Number.isFinite(float)) {
				return string;
			}

			return float;
		} else if (this.detectDates) {
			const date = new Date(string);

			if (isNaN(date.getTime())) {
				return string;
			}

			return date;
		} else {
			return string;
		}
	}
}

module.exports = TypeCoercer;
