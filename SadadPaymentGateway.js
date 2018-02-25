const helper = require('./lib/helper')
const moment = require('moment')

/**
 * @typedef {object} Config
 * @property {string} key
 * @property {string} merchantId
 * @property {string> terminalId
 * @property {string> returnUrl
 */


class SadadPaymentGateway {

	/**
	 * @constructor
	 * @class SadadPaymentGateway
	 * @param {Config} config required Sadad Payment gateway configuration
	 */
	constructor(config) {
		if (!config) {
			throw new Error('Missed configs')
		}
		else if (!helper.validateConfig(config)) {
			throw new Error('Invalid config')
		}
		else {
			this._config = config
		}
	}

	/**
	 * @description get token for make payment
	 * @memberOf SadadPaymentGateway
	 * @param {number} amount In rials.
	 * @param {string} orderId
	 * @return {Promise<{ResCode:string,Token:string,Description:string,redirectURL:string}>} @see {@link module:PaymentRequestResCode}
	 */
	async getPaymentToken(amount, orderId) {
		const dateTime = moment().format('M/D/Y h:m:s a')
		const signData = helper.encryptPkcs7(`${this._config.terminalId};${orderId};${amount}`, this._config.key)
		const data = {
			TerminalId: this._config.terminalId,
			MerchantId: this._config.merchantId,
			Amount: amount,
			SignData: signData,
			ReturnUrl: this._config.returnUrl,
			LocalDateTime: dateTime,
			OrderId: orderId,
		}
		try {
			const results = await helper.getToken(data)
			return {
				results: results,
				status: true,
				redirectURL: `https://sadad.shaparak.ir/VPG/Purchase?Token=$${results.Token}`,
			}
		}
		catch (err) {
			return {
				results: {
					message: err.message,
				},
				status: false,
			}
		}


	}

	/**
	 * @description verify the payment
	 * @memberOf SadadPaymentGateway
	 * @param {string} orderId
	 * @param {string} token
	 * @param {number} resCode
	 * @return {Promise<{status:boolean,results:object,message:string}>} @see {@link module:VerifyResCode}
	 */
	async verifyPayment(orderId, token, resCode) {
		if (resCode.toString() === '0') {
			const verifyData = {
				Token: token,
				SignData: helper.encryptPkcs7(token, this._config.key),
			}
			const res = await helper.verifyPayment(verifyData)
			if (res.ResCode.toString() !== '-1') {
				return {
					message: 'تراکنش نا موفق بود در صورت کسر مبلغ از حساب شما حداکثر پس از 72 ساعت مبلغ به حسابتان برمی گردد.',
					results: res,
					status: false,
				}
			}
			else {
				return {
					status: true,
					message: 'تراکنش موفق',
					results: res,
				}
			}
		}
		else {
			return {
				status: false,
				message: 'invalid res code',
				results: {
					invalidResponseSendFromBank: resCode,
				},
			}

		}
	}
}

module.exports = SadadPaymentGateway
