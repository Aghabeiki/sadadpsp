const {MCrypt} = require('mcrypt')
const request = require('request')
const requester = (url, data) => {
	const options = {
		method: 'POST',
		url: url,
		headers:
						{
							'Content-Length': JSON.stringify(data).length,
							'Content-Type': 'application/json',
						},
		body: data,
		json: true,
	}

	return new Promise((resolve, reject) => {
		request(options, function(error, response, body) {
			if (error) {
				reject(new Error(error))
			} else {
				resolve(body)
			}
		})
	})
}
/**
 * @private
 * @module module:helper
 * @type {object}
 */
const helper = module.exports = { // eslint-disable-line no-unused-vars
	/**
		 *@private
		 * @memberOf module:helper
		 * @param {string}str
		 * @param {string}key
		 * @return {string}
		 */
	encryptPkcs7: (str, key) => {
		const tripleDESEcb = new MCrypt('tripledes', 'ecb')
		const Key = Buffer.from(key, 'base64')
		const blockSize = tripleDESEcb.getBlockSize()
		const extraPad = blockSize - (str.length % blockSize)
		const targetStr = str + Array(extraPad)
			.fill(String.fromCharCode(extraPad)).join('')
		tripleDESEcb.open(Key)
		return tripleDESEcb.encrypt(targetStr).toString('base64')
	},
	/**
		 * @private
		 * @memberOf module:helper
		 * @param config
		 * @return {boolean}
		 */
	validateConfig: (config) => {
		const validVerbs = ['key', 'merchantId', 'terminalId', 'returnUrl']
		const configs = Object.entries(config)
		if (configs.length !== 4) {
			return false
		} else {
			return configs.reduce((p, item) => {
				// validate verb
				p = p && validVerbs.indexOf(item[0]) !== -1
				// validate value
				p = p && typeof item[1] === 'string' && item[1].length !== 0
				return p
			}, true)
		}
	},

	/**
		 * @private
		 * @memberOf module:helper
		 * @param data
		 * @return {Promise<{‫‪ResCode‬‬:number,‫‪Token‬‬:string,‫‪Description‬‬:string}>}
		 */
	getToken: (data) => {
		return requester('https://sadad.shaparak.ir/vpg/api/v0/Request/PaymentRequest', data)
	},
	/**
		 * @property
		 * @memberOf module:helper
		 * @param {object} data
		 * @return {Promise<{‫‪ResCode‬‬:number,‫‪Amount‬‬:string,‫‪Description‬‬:string,‫‪RetrivalRefNo‬‬:string,‫‪SystemTraceNo‬‬:string,‫‪OrderId‬‬:string}>}
		 */
	verifyPayment: (data) => {
		return requester('https://sadad.shaparak.ir/vpg/api/v0/Advice/Verify', data)
	},
}
