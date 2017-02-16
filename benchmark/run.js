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
		const chunk = Buffer.allocUnsafe(chunkSize);

		var off = 0;

		while (off < chunk.length) {
			data.copy(chunk, off);

			off += chunk.length;
		}

		return chunk;
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
 * @returns {Promise}
 */
const run = (datasetName, repeatCount) => {
	return new Promise((success, reject) => {
		const repeater = new Repeater(path.join(__dirname, 'datasets', datasetName + '.csv'), repeatCount);
		const sp = new StreamParser();

		process.stdout.write(
			'Dataset `' + datasetName + '`'
			+ ' ['
				+ 'x' + repeater.realRepeatCount
				+ ', ' + (repeater.bytesCount / 1024 / 1024).toFixed(1) + ' MiB'
			+ ']'
			+ ': ');

		const start = process.cpuUsage();

		sp.on('data', () => {});
		sp.on('end', () => {
			const ela = process.cpuUsage(start).user / 1e6;

			process.stdout.write('' + ela.toFixed(3) + ' sec\n');

			success();
		});

		repeater.pipe(sp);
	});
};

Promise.resolve()
	.then(() => run('ru-opendata', 50000))
	.then(() => run('short-lines', 5000000))
;
