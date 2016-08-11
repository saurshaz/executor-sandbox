const env = require('./lib/environment')
const log = require('./lib/logger')

module.exports = {
	// @todo : also check the header on the request here, only executor server shall be allowed
	checkAuth: (ticker,cb) => {
		// cb(null, true)
		env._filesdb.collection('tickers').findAndModify({ticker:ticker, status:0},[],{ $set: {status: 1} },{ new: false }, (err, data) => {
			log.info(` data is ${JSON.stringify(data)} `)
			if(!err && data && data.value && data.value.ticker){
				cb(null, true)
			} else {
				cb({err: err, detail: `error in finding mentioned ticker - ${ticker}`}, null)
			}
    	});
	}
};