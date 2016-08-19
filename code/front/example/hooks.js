module.exports = {
  // add logic to run after files have been created into datbase,
  // config._id is the new file created
  // config.filename is the created file name
  // config.filepath is the created file path
  // config.db is the db instance for any db operations
  postAddFileToDatabase:function (config, cb) {
    console.log(' *** adding new files ****')
    const context = require('./context')

    config.db.collection('fs.files').update({_id:config._id},
      {
        '$set':{
          'metadata.filename':config.filename,
          'metadata.data':context.data,
          'metadata.secrets':context.secrets,
          'metadata.modules':context.modules,
          'metadata.date_created':new Date()
        }
      },
      {$multi:true}
      , cb)
  }
}
