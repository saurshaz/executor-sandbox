module.exports = {
    "rid": "12345abcde",
    "function_users": ["u1"],
    "function_groups": ["g3"],
    "arguments": {
      "a":54,
      "b":46,
      "user_id":"<%=secrets.facebook.user_id%>"
    },
    "data": {
    },
    "secrets":{
      "facebook":{
        "user_id":"saurshaz",
        "group_id":"admin",
        "redirect_uri":"http://appler.xyz/cb/facebook?param1="
      }
    },
    "modules":{
      "ejs":"latest",
      "mongoskin":"latest"
    },
    "date_created":"new Date()"
    
 }
  