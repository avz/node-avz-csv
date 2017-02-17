'use strict';

const Readable = require('stream').Readable;
const StreamParser = require('../').StreamParser;

const fs = require('fs');
const path = require('path');

class Repeater extends Readable
{
	/**
	 *
	 * @param {string} datasetPath
	 * @param {number} repeatCount
	 * @returns {Repeater}
	 */
	constructor(datasetPath, repeatCount)
	{
		super();

		const dataset = fs.readFileSync(datasetPath);

		this.chunk = this.makeChunk(dataset, 32 * 1024);
		this.chunkRepeatCount = Math.ceil(repeatCount / (this.chunk.length / dataset.length));
		this.realRepeatCount = Math.ceil(this.chunkRepeatCount * (this.chunk.length / dataset.length));
		this.bytesCount = this.chunk.length * this.chunkRepeatCount;

		this.iterationNumber = 0;

		this.flush = () => {
			this.push(this.chunk);
		};
	}

	/**
	 *
	 * @param {Buffer} data
	 * @param {number} minSize
	 * @returns {Buffer}
	 */
	makeChunk(data, minSize)
	{
		if (data.length > minSize) {
			return data;
		}

		const chunkSize = Math.ceil(minSize / data.length) * data.length;

		return Buffer.allocUnsafe(chunkSize).fill(data);
	}

	/**
	 *
	 * @param {number} size
	 * @returns {undefined}
	 */
	_read(size)
	{
		if (this.iterationNumber >= this.chunkRepeatCount) {
			this.push(null);

			return;
		}

		setImmediate(this.flush);

		this.iterationNumber++;
	}
}

/**
 *
 * @param {string} datasetName
 * @param {number} repeatCount
 * @param {object} options
 * @returns {Promise}
 */
const run = (datasetName, repeatCount, options) => {
	return new Promise((success, reject) => {
		const repeater = new Repeater(path.join(__dirname, 'datasets', datasetName + '.csv'), repeatCount);
		const sp = new StreamParser(options);

		process.stdout.write(
			'' + datasetName + ' ' + JSON.stringify(options)
			+ ' ['
				+ 'x' + repeater.realRepeatCount
				+ ', ' + (repeater.bytesCount / 1024 / 1024).toFixed(1) + ' MiB'
			+ ']'
			+ ': ');

		const start = process.cpuUsage();
		var rowsCount = 0;

		sp.on('data', (d) => {
			if (options.batch) {
				rowsCount += d.length;
			} else {
				rowsCount++;
			}
		});

		sp.on('end', () => {
			const ela = process.cpuUsage(start).user / 1e6;

			process.stdout.write(
				'' + ela.toFixed(3) + ' sec'
				+ ' ('
					+ rowsCount + ' rows'
					+ ', ' + (rowsCount / ela).toFixed(0) + ' rows per cpu user sec'
				+ ')\n'
			);

			success();
		});

		repeater.pipe(sp);
	});
};

Promise.resolve()
	.then(() => run('short-lines', 500000, {batch: false}))
	.then(() => run('short-lines', 500000, {batch: false, rtrim: true, ltrim: true}))
	.then(() => run('short-lines', 500000, {batch: true}))
	.then(() => run('large-lines', 50000, {batch: false}))
	.then(() => run('large-lines', 50000, {batch: false, rtrim: true, ltrim: true}))
	.then(() => run('large-lines', 50000, {batch: true}))
	.then(() => run('numbers', 500000, {batch: true, detectNumbers: false}))
	.then(() => run('numbers', 500000, {batch: true, detectNumbers: true}))
	.then(() => run('dates', 500000, {batch: true, detectDates: false}))
	.then(() => run('dates', 500000, {batch: true, detectDates: true}))
;
