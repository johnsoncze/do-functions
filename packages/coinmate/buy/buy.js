const config = require('./config')
const slack = require('./slack')(config)
const utils = require('./utils')
const coinmate = require('./coinmate')(config)
const logger = require('./logger')
const api = require('./api')(config)

exports.main = async (args) => {
	try {
		const transactionId = await coinmate.buy(args.amountToBuy)
		logger(`Transaction ID: ${transactionId}`);
		const transactions = await coinmate.getTransactions(transactionId);
		logger('(timestamp, price, amount, fee, spent)');
		await utils.asyncForEach(transactions, async (t) => {
			const spent = t.price * t.amount + t.fee;
			logger(`(${new Date(t.timestamp)}, ${t.price}, ${t.amount}, ${t.fee}, ${spent})`);
			await slack.send({
				text: `I bought \`${t.amount}\` BTC for you. I spent \`${spent}\` CZK. :moneybag:`
			})
			await api.saveTransaction(spent, t.amount, new Date(t.timestamp), 'BTC')
		});
		logger('done')
	} catch (error) {
		logger(error)
	}
}
