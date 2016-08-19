####################
# executor         #
####################

## Short summary
- overall objective is to do a lightweight and delicate `FaaS` service

----
- First step is to understand the structure of writing a function
- Second step is to write a simple function accompanied by needed `context.js` file (`dependencies`, `inputs`, `secrets` defination)
- Third step is to upload functions to storage
- Fourth step is to hit the url via `postman` or `curl` or any calling `code` and get the `output` after running the function in *executor* framework (this would be callee part)

----
### Running it 
- nodemon src/ --env=prod (`change .env file for referring to stage server`)
----

----
## todos
----
- sort out `ejs` template bug fix in the `coditor` related to `<%=` escaping
- actually sandbox the `executor-sandbox`
- refactor code to take related code to `dao` layer
- update README regd `example` building, running with `mocha` and then using `web interface` for using the system
- handle security of `secrets` within functions so that anyone can't just read them
- frontend files (segregate `metadata.js` into different files)
- handle requests from anyone not runnable by the `sandbox server`. right the referrer shall only be the executor server (generate and insert a token from `executor` and check & eliminate the received one which exists from `executor-sandbox` )
- logic to handle used `modules` installation/fetching/referring (simpler way is to have a number of them installed in a directory above for sandbox-server)
- add logic to `auto-run upon demand` the `sandbox` server 
- set this up in `heroku`/`vps hosted` app
- use this with `one-api` and/or `applyx`
- work on `mrrequire`
- work on linting





## pre-installed 3rd party modules in sandbox-server
- momentjs
- mongodb
- more to be added ... 
