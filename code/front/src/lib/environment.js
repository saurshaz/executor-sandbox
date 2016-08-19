const habitat = require('habitat')
let env = new habitat()
const MongoClient = require('mongodb').MongoClient
if (process.env.NODE_ENV === 'stage') {
  habitat.load(require('path').resolve(__dirname, '../../config/.env.stage'))
}else if (process.env.NODE_ENV === 'prod') {
  habitat.load(require('path').resolve(__dirname, '../../config/.env.prod'))
} else {
  habitat.load(require('path').resolve(__dirname, '../../config/.env'))
}

// Initialize connection once
MongoClient.connect(process.env.FILES_MONGO_URI || process.env.DB_URL,  (err, database) => {
  if(!err) {
	  env._filesdb = database	
  } else {
  	throw err
  }
})

module.exports = env
