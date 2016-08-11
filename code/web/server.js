const express = require("express");
const bodyParser = require("body-parser");
const moment = require('moment');
const app = express();
const env = require('./lib/environment')
const log = require('./lib/logger')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.put("/run", function(request, response) {
    var code = request.body && request.body.code && eval(request.body.code)
    var args = request.body && request.body.args

    code(args, (e, r) => {
      if(!e){
        // @todo :: remove this - shall be replaced with arequest id which is unique for this request mad
        r.abc='xyz'
        response.json(r)
      }else{
        response.json({e:e,error:'error in executing code'})
      }
    })
});


app.listen(3600, () => {
  console.log('now ... ',moment(new Date()).format('YYYY-MM-DD > HH:MM:SS'))
  console.log('executor-service Server is running at -', 3600)
})
