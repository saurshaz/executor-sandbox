const async = require('async')
const fs = require('fs')
const mongo = require('mongodb')
const Grid = require('gridfs-stream')
const GridStore = require('mongodb').GridStore
const env = require('../lib/environment')
const log = require('../lib/logger')

module.exports = {
  saveFunction: (db, body, cookies, callback) => {
      let metadata = JSON.parse(body.content['metadata.js'])
      metadata.callee = cookies.loggedinuserid
      metadata.function_groups = [].concat(metadata.function_groups || [])
      metadata.function_users = [cookies.loggedinuserid].concat(metadata.function_users || [])
      let gs = new GridStore(db, body.fn_name + '.js', "w",{
        "content_type": "application/javascript",
        "metadata": metadata,
        "chunk_size": 1024*4
      });

      // Open the file
      gs.open( (err, gs) => {
        if (err) {
          //db.close();
          log.info({
              'message': err
          });
          callback({err:err}, null);
        } else {
          let writable = body.content[body.fn_name + '.js'];
          if (typeof body.content === "string") {
              writable = new Buffer(body.content);
          }

          // Write some content to the file
          gs.write(writable, (err, gs) => {
            if(!err){
              gs.close((err, fileData) => {
                callback(err, fileData)
              });
            } else{
              callback(err, fileData)
            }
          })
        }
      });
  }
}
