const config = require('./config')
const slack = require('./slack')(config)
const utils = require('./utils')
const coinmate = require('./coinmate')(config)
const logger = require('./logger')
const api = require('./api')(config)

exports.main = async (args) => {
	try {
		const balances = await coinmate.getBalances()
		logger('Current balances:');
		for (const [currency, balance] of Object.entries(balances)) {
			logger(`${currency}: ${JSON.stringify(balance)}`); // BTC: {"currency":"BTC","balance":0.06805473,"reserved":0,"available":0.06805473}
			if (balance.available === 0) continue;
			
			let text = `Current balance of \`${balance.available}\` ${currency}.`;
			if (currency === 'BTC') {
				const ticker = await coinmate.getTicker('BTC_CZK');
				const czkValue = balance.available * ticker.last;
				logger(`BTC CZK value: ${czkValue}`);
				text += ` That's about \`${czkValue}\` CZK. :moneybag:`;
			}
			slack.send({
				text
			});
		}
		logger('done')
	} catch (error) {
		logger(error)
	}
}
