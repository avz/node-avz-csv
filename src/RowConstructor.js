'use strict';

class RowConstructor
{
	/**
	 *
	 * @param {string[]} columnNames
	 * @returns {RowConstructor}
	 */
	constructor(columnNames)
	{
		this._createFromArray = this._compileFunction(columnNames);
	}

	/**
	 *
	 * @param {string[]} columnNames
	 * @returns {Function}
	 */
	_compileFunction(columnNames)
	{
		const uniq = new Set;

		for (const name of columnNames) {
			if (uniq.has(name)) {
				throw new Error('Duplicate column name: ' + name);
			}

			uniq.add(name);
		}

		var code = 'const row = {';

		for (var i = 0; i < columnNames.length; i++) {
			const name = columnNames[i];

			code += '\t' + JSON.stringify(name) + ': fields[' + i + '],\n';
		}

		code += '};\n\n';

		code += 'return row;\n';

		return new Function('fields', code);
	}

	/**
	 *
	 * @param {*[]} fields
	 * @returns {Function}
	 */
	createFromArray(fields)
	{
		return this._createFromArray(fields);
	}
}

module.exports = RowConstructor;
