'use strict';

const ovsxSign = require('node-ovsx-sign');

async function verify(vsixFilePath, signatureArchiveFilePath, verbose) {
	try {
		await ovsxSign.verify(vsixFilePath, signatureArchiveFilePath, verbose);
		return {
			code: 'Success',
			didExecute: true
		};
	} catch (error) {
		return {
			code: error && typeof error.code === 'string' ? error.code : 'UnknownError',
			didExecute: Boolean(error && error.didExecute),
			output: error && error.output ? String(error.output) : (error && error.message ? String(error.message) : String(error))
		};
	}
}

module.exports = {
	verify
};
