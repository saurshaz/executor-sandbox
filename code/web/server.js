var express = require("express");
var bodyParser = require("body-parser");
var moment = require('moment');
var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.put("/run", function(request, response) {
    var code = request.body && request.body.code && eval(request.body.code)
    var args = request.body && request.body.args

    code(args, (e, r) => {
      if(!e){
        r.abc='xyz'
        console.log('until ... ',moment('1977-08-20 14:29:00 UTC').fromNow())
        response.json(r)
      }else{
        response.json({e:e,error:'error in executing code'})
      }
    })
});


app.listen(3600, () => {
  console.log('until ... ',moment('1977-08-20 14:29:00 UTC').fromNow())
  console.log('executor-service Server is running at -', 3600)
})
