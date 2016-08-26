const request = require('request')
const assert = require('assert')
const dao = require('../src/dao')
const utils = require('../src/lib/utils')
const MongoClient = require('mongodb').MongoClient
const log = require('../src/lib/logger')

const getConnection = (cb) => {
  MongoClient.connect(process.env.DB_TEST_URL, cb)
}

const invoke = (fn_name, fn_args, callee, cb) => {
  getConnection((err, _db) => {
    if (!err) {
      utils.processMe(process.env.SANDBOX_SERVICE_URL, _db, {handler:fn_name, arguments:fn_args, callee:callee}, (err, results) => {
        _db.close()
        cb(err, results)
      })
    } else {
      cb(err, undefined)
    }
  })
}

const function_body = `// before reaching
                                  module.exports = (ctx, callback) => {
                                    const moment = require('moment')

                                    console.log('**FROM HANDLER**')
                                    console.log('**************')
                                    console.log('ctx.arguments >> ')
                                    console.log(ctx.arguments)

                                    console.log('ctx.secrets >> ')
                                    console.log(ctx.secrets)

                                    console.log('ctx.data >> ')
                                    console.log(ctx.data)

                                    console.log(' dynamic code added here >> ',moment(new Date()).format('YYYY-MM-DD > HH:MM:SS'))

                                    console.log(' adding '+ ctx.arguments.a +' & '+ ctx.arguments.b +' >> ', (ctx.arguments.a + ctx.arguments.b))
                                    // do nothing right now , just echo input back
                                    callback(null, (ctx.arguments.a + ctx.arguments.b))
                                  }`

const function_metadata = {
  'rid':'12345abcde',
  'arguments':{
    'a':54,
    'b':46,
    'user_id':'<%=secrets.facebook.user_id%>'
  },
  function_groups:['g3'],
  function_users:['u1'],
  'data':{
  },
  'secrets':{
    'facebook':{
      'user_id':'saurshaz',
      'group_id':'admin',
      'redirect_uri':'http://appler.xyz/cb/facebook?param1='
    }
  },
  'modules':{
    'ejs':'latest',
    'mongoskin':'latest'
  },
  'date_created':'new Date()'
}

describe('executor', function (done) {
  this.timeout(10000)
    // test = require('assert');

  beforeEach((done) => {
    getConnection((err, _db) => {
      if (err) {

      } else {
        _db.collection('user_groups').remove({}, (err, db) => {
          if (err) {

          } else {
            // remove all users
            _db.collection('users').remove({}, (err, db) => {
              if (err) {

              } else {
              // create groups G1, G2, G3
                const groups_to_be_created = [
                  {id:'g1', active:true},
                  {id:'g2', active:true},
                  {id:'g3', active:true}
                ]
                _db.collection('user_groups').insert(groups_to_be_created, (err, db) => {
                  if (err) {

                  } else {
                      // create a U1 user belonging to G1,G2
                      // create a U2 user belonging to G2
                        // create a U3 user belonging to G3
                    const users_to_be_created = [
                          {id:'u1', active:true, groups:['g1', 'g2']},
                          {id:'u2', active:true, groups:['g2']},
                          {id:'u3', active:true, groups:['g3']}
                    ]
                    _db.collection('users').insert(users_to_be_created, (err, db) => {
                      if (err) {

                      } else {
                              // remove all functions
                        _db.collection('fs.files').remove({}, (err, db) => {
                          if (err) {

                          } else {
                                // create a new function F1
                                // insert credentials (Users - U1 & Roles G3) for F1 in credentials collection
                            const body = { content:{'metadata.js':'', 'f1.js':''}}

                            body.content['f1.js'] = function_body
                            body.content['metadata.js'] = JSON.stringify(function_metadata)
                            body.fn_name = 'f1'
                            dao.saveFunction(_db, body, {loggedinuserid:'u1'}, (err, fileData) => {
                              done()
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
      // a function F2 does not exist, try to invoke it, with a U1 user credentials, proper error
      // remove all groups
    })
  })

  it('invoke a existing function without proper credentials - uU1_gG3 ', (done) => {
    // a function F1 exists, try to invoke it, with a U2 user credentials
    // auth check begins - fetch function permission entry, (uU1_gG3)
    //                   - check if function_users contain U2 or if function_groups groups contain U2 :: No
    //                   - if not return with permission error
    //                   - if yes continue with function call
    //
    // assert(false)
    getConnection((err, _db) => {
      if (!err) {
        invoke('f1', {a:55, b:45}, 'u2', (err, results) => {
          log.info('err ', err)
          log.info('results ', results)
          assert.notEqual(err, null)
          assert.equal(err.detail, 'error in authorization for user - u2 on f1')
          assert.equal(results, null)
          done()
        })
      } else {

      }
    })
  })

  it('invoke a non-existing function', (done) => {
    invoke('f2', {a:55, b:45}, 'u1', (err, results) => {
      if (!err) {
        log.error('err >> ', err)
        // log.info('results >> ',results)
        assert.notEqual(err, undefined)
        assert.equal(err.detail, 'could not find a matching function for f2')
        assert.notEqual(results, 100)
        done()
      } else {

      }
    })
  })

  it('invoke a existing function with proper credentials - proper user access, use who is allowed access ', (done) => {
    // a function F1 exists, try to invoke it, with a U1 user credentials
    // auth check begins - fetch function permission entry, (uU1_gG3)
    //                   - check if function_users contain U1 or if function_groups groups contain U1 :: Yes
    //                   - if not return with permission error
    //                   - if yes continue with function call
    //
    // assert(false)
    getConnection((err, _db) => {
      if(!err){
      invoke('f1', {a:55, b:45}, 'u1', (err, results) => {
        assert.equal(err, null)
        assert.equal(results, 100)
        done()
      })
      else {

     }
    })
  })

  it('invoke a existing function with proper credentials - improper user access but proper group who is allowed access ', (done) => {
    // a function F1 exists, try to invoke it, with a U3 user credentials
    // auth check begins - fetch function permission entry, (uU1_gG3)
    //                   - check if function_users contain U3 or if function_groups groups contain U3 :: yes
    //                   - if not return with permission error
    //                   - if yes continue with function call
    //
    // assert(false)
    getConnection((err, _db) => {
      invoke('f1', {a:55, b:45}, 'u3', (err, results) => {
        assert.equal(err, null)
        assert.equal(results, 100)
        done()
      })
    })
  })

  it('request', (done) => {
    var options = {
      method:'PUT',
      url: `${process.env.SERVER_URL}/fly`,
      headers:{
        'cache-control':'no-cache',
        'content-type':'application/json'
      },
      body:{
        rid:'12345abcde',
        arguments:{ a:'a1', b:'b1', user_id:'<%=secrets.facebook.user_id%>' },
        handler:'function.js'
      },
      json:true
    }

    request(options, function (error, response, body) {
      if (error) {

      } else {
        // console.log(body);
        //     { secrets:
        //  { facebook:
        //     { user_id: 'saurshaz',
        //       group_id: 'admin',
        //       redirect_uri: 'http://appler.xyz/cb/facebook?param1=' } },
        // arguments: { a: 'a1', b: 'b1', user_id: 'saurshaz' },
        // data: { commands: [ [Object] ] } }
        assert(body.secrets !== null, true)
        // @todo :: use deep-equals utility method
      }
      done()
    })
  })
})
