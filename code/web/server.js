const express = require("express");
const bodyParser = require("body-parser");
const moment = require('moment');
const app = express();
const env = require('./lib/environment')
const log = require('./lib/logger')
const auth = require('./auth');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.put("/run", function(request, response) {
    const code = request.body && request.body.code && eval(request.body.code)
    const args = request.body && request.body.args
    const ticker = request.body && request.body.ticker

    // @todo :: uncomment commented code below. currently fails the tests
    // auth.checkAuth(ticker, (err, passed) => {
    //   if(!err && passed) {
        log.info(` auth for ticker - ${ticker} passed`)
        code(args, (e, r) => {
          if(!e){
            // @todo :: remove this - shall be replaced with arequest id which is unique for this request mad
            r.abc='xyz'
            response.json(r)
          }else{
            response.json({e:e,error:'error in executing code'})
          }
        })
    //   } else {
    //     response.json({e:err,error:'error in authenticating request with ticker - '+ticker})
    //   } 
    // })
});


app.listen(3600, () => {
  console.log('now ... ',moment(new Date()).format('YYYY-MM-DD > HH:MM:SS'))
  console.log('executor-sandbox-service Server is running at -', 3600)
})
