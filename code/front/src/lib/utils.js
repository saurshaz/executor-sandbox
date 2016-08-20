
const path = require('path')
const dao = require('../dao/')
const mongodb = require('mongodb');
const async = require('async')
const GridStore = require('mongodb').GridStore
const request = require('request')
const ejs = require('ejs')
const env = require('./environment')
const log = require('./logger')
const superagent = require('superagent');

const matching_groups = (function_groups, my_groups) => {
  let arr = []
  for (var i = my_groups.length - 1; i >= 0; i--) {
    if(function_groups.indexOf(my_groups[i]) !== -1){
      arr.push(my_groups[i])
    }
  }
  return arr;
}

exports.processMe = (_sandbox_url, _db, ctx, cb) => {
  async.waterfall([
    (callback) => {
          _db.collection('fs.files').findOne({ 'filename': ctx.handler +'.js' }, (err, file) => {
            if (err || !file) {
               callback({err: err, detail: `could not find a matching function for ${ctx.handler}`}, null)
            } else {
              callback(null, file)
            }
          })
        },
        (file, callback) => {
          // process authentication and authoriation here
          log.info(' ctx.callee >>> ', ctx.callee)
          let isAllowed = false
          // console.log(file.metadata.function_users)
          isAllowed = (file.metadata && file.metadata.function_users && file.metadata.function_users.indexOf && file.metadata.function_users.indexOf(ctx.callee) !== -1)
          if(!isAllowed){
            // (file.metadata.function_groups, current_user) => {
            // @todo :: defense here if no user as specified found
            _db.collection('users').findOne({id: ctx.callee}, (err, user) => {
              if(user && user.groups){
                if(matching_groups(file.metadata.function_groups, user.groups).length > 0){
                  isAllowed = true
                }
                callback(null, isAllowed, file)
              } else {
                callback({err : 'no user found', detail: `No user found for ${ctx.callee}`}, null, file)
              }
            })
          } else {
            callback(null, isAllowed, file)
          }
         },
         (isAllowed, file, callback) => {
            log.info(' auth passed ? ',isAllowed)
            if(!isAllowed){
              callback({err:'', detail:`error in authorization for user - ${ctx.callee} on ${ctx.handler}`, code:403}, null)
            } else {
              // Open a new file
              const gridStore = new GridStore(_db, file, 'w')

              // Open the new file
              gridStore.open((err, gridStore) => {
                GridStore.read(_db,
                  new mongodb.ObjectID(file._id.toString('base64')),
                  (err, fileData) => {
                    if (err) {
                      log.error('>>>> error >>>>  ', err)
                    } else {
                      file.buffer = fileData
                      callback(err, file)
                    }
                  })
              })
            }
          },
    (fn_data, callback) => {
      let wrapper = {
        fn: ctx.handler, 
        secrets: fn_data.metadata.secrets
      }

      // merge req_data and arguments with secrets data
      let merged_args = ejs.render(JSON.stringify(ctx.arguments), wrapper)
      let merged_data = ejs.render(JSON.stringify(fn_data.metadata.data), wrapper)

      wrapper.arguments = JSON.parse(merged_args)
      wrapper.data = JSON.parse(merged_data)

      callback(null,wrapper,fn_data);
    },
    (wrapper,fn_data,callback) => {
      // @todo :: generate this uniquely in abetter manner later
      const timestamp = new Date().getUTCMilliseconds();
      // @todo :: replace abcde with userid
      const full_ticker = `abcde-${timestamp}`
      _db.collection('tickers').insert({ticker:full_ticker, status: 0, created: timestamp}, (e, data) => {
        const options = { 
            method: 'PUT',
            url: _sandbox_url,
            headers: 
             { 
               'cache-control': 'no-cache',
               'content-type': 'application/json' 
             },
            body: 
            {
              ticker: full_ticker,
              code: fn_data.buffer.toString(),
              args: wrapper
            },
            json: true
        };

        log.info('calling '+ ctx.handler +' with data >> ')
        // log.info(wrapper)
        request(options, (err, results) => {
          if(!err && (results && results.body)){
            log.info('results >>  ',results.body)
            callback(null, results.body)
          }else{
            callback({err: err, 'detail': 'error in running code'}, null)
          }
        })
      })
    }], cb)
}