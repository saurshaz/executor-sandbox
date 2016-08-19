// before reaching

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
}