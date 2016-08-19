const express = require('express')
const session = require('express-session')
const path = require('path')
const dao = require('./dao/')
const mongodb = require('mongodb');
const async = require('async')
const router = express.Router()
const GridStore = require('mongodb').GridStore
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const request = require('request')
const ejs = require('ejs')
const app = express()
const env = require('./lib/environment')
const log = require('./lib/logger')
const utils = require('./lib/utils')
const superagent = require('superagent');
require('newrelic')

// @todo 
// have default groups setup, ability to add new
// ability to add users to groups 
// login flow
// post-login
// create users collection entry with default groups allocated
// when saving a function, add user identity and user who created along with specified users
// and function groups specified for access

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.engine('html', ejs.renderFile)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
  secret: 'i8a@l9p#o0p$v1le2ea3rp4rp5ol6ce7kr8s',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    maxAge: new Date(Date.now() + 3600000)
  }
}))
app.use(express.static(path.join(__dirname,  'public')))

const clear = (res) => {
  res.clearCookie('loggedinuserid');
  res.clearCookie('applerac');
  res.clearCookie('auth');
  res.redirect(process.env.EXECUTOR_URL)
}

app.get('/logout', (req, res) => {
  clear(res)
})

app.get('/get_user', (req, res) => {
  req.session.userInfo = req.cookies
  if(req.session.userInfo && req.session.userInfo.loggedinuserid){
    superagent.get(`http://${process.env.AUTH_HOST}/decode_user?applerac=${req.cookies.applerac}`)
    .set('http_referer', process.env.EXECUTOR_URL)
    .set('referer', process.env.EXECUTOR_URL)
    .end( (err, response) => {
        if(err){
         log.error('error ', err)
         res.json({err: err})
        }else{
         res.json(response.body)
        }
    })
  } else {
    // clear(res)
    res.json({err: 'nothing in session'})
  }
})

app.get('/', (req, res) => {
  req.session.userInfo = req.cookies
  res.render('index', {REDIRECT_URI_PATH: process.env.EXECUTOR_URL, AUTH_SERVER_URL: process.env.AUTH_SERVER_URL, userInfo: req.session.userInfo})
})

app.put('/persist', (req, res) => {
  req.session.userInfo = req.cookies
  if(!(req.session.userInfo && req.session.userInfo.loggedinuserid)){// @todo :: add session checking/token checking
    res.json({err: 'err', detail: 'not logged in'})
  } else {
    dao.saveFunction(env._filesdb, req.body, req.session.userInfo, (err, fileData) => {
      if (err) {
        log.info({
            'message': 'writefile -- writing to GridStore -- err',
            'text': err
        });
        res.json({err:err});
      } else {
        // Flush to the GridFS
        res.json({err: err, data: fileData})
      }
    })
  }
})

app.put('/fly', (req, res) => {
  const ctx = req.body
  log.info(' handler is ', ctx.handler)
  log.info(' ctx is ', ctx)
  ctx.callee = req.cookies.loggedinuserid
  utils.processMe(process.env.SANDBOX_SERVICE_URL, env._filesdb, ctx, (err, results) => {
    if (!err) {
      res.json(results)
    } else {
      res.json({err: err, detail: ' error in executing code'})
    }
  });
})

app.listen(process.env.PORT, () => {
  log.info('Executor Server is running at -', process.env.PORT)
})


