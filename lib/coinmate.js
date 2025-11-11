const requestPromise = require('request-promise');
const crypto = require('crypto');

module.exports = (config) => {

	const {clientId, publicKey, privateKey} = config.api;

	const getSignature = (nonce) => {
		if (config.testing) return 'E4F27EAB0A836873CEE325A2526CC7476E2A3F2BE8026CADFB7A66B72D582DE8'
		const msg = `${nonce}${clientId}${publicKey}`;
		return crypto
			.createHmac('sha256', Buffer.from(privateKey, 'utf8'))
			.update(msg)
			.digest('hex')
			.toUpperCase();
	};

	const getTransactions = async (orderId) => {
		const nonce = +new Date();
		const { data: transactions } = await requestPromise({
			method: 'POST',
			url: `${config.api.baseUrl}/transactionHistory`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			json: true,
			body: `orderId=${orderId}&clientId=${clientId}&publicKey=${publicKey}&nonce=${nonce}&signature=${getSignature(nonce)}`
		});
		return transactions;
	};

	const buy = async (amountToBuy) => {
		const nonce = +new Date();
		const { data: id } = await requestPromise({
			method: 'POST',
			url: `${config.api.baseUrl}/buyInstant`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			json: true,
			body: `total=${amountToBuy}&currencyPair=btc_czk&clientId=${clientId}&publicKey=${publicKey}&nonce=${nonce}&signature=${getSignature(nonce)}`
		});
		return id;
	};

	const getBalances = async () => {
		const nonce = +new Date();
		const { data: balances } = await requestPromise({
			method: 'POST',
			url: `${config.api.baseUrl}/balances`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			json: true,
			body: `clientId=${clientId}&publicKey=${publicKey}&nonce=${nonce}&signature=${getSignature(nonce)}`
		});
		return balances;
	}

	const getTicker = async (pair) => {
		const { data: ticker } = await requestPromise({
			method: 'GET',
			url: `${config.api.baseUrl}/ticker?currencyPair=${pair}`,
			json: true,
		});
		return ticker;
	}

	return {
		buy,
		getTransactions,
		getBalances,
		getTicker,
	}
}

