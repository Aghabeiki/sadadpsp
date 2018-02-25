const should = require('should')
const {MCrypt} = require('mcrypt')
const {encryptPkcs7} = require('../../lib/helper')
describe('- validate encryptPkcs7 function', () => {
	const key = 'YXNkYXNkYXNkYWFzZGFzZGFzZGFhc2Rm'
	const msg = 'sample text'
	it('-should encrypt a string with special key', () => {
		const cryptedMsg = encryptPkcs7(msg, key)
		should(cryptedMsg).be.eql('Zg32pLW8U0bNgwetLeaP3g==')
		// try to encrypt it.
		const tripleDESEcb = new MCrypt('tripledes', 'ecb')
		tripleDESEcb.open(Buffer.from(key, 'base64').toString('ascii'))
		const str = tripleDESEcb.decrypt(Buffer.from(cryptedMsg, 'base64')).toString()
		const pading = str[str.length - 1]
		str.substring(0, str.length - pading.charCodeAt(0))
			.should.be.eql(msg)
	})
})
