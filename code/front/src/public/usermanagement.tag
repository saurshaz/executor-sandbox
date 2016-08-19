<usermanagement>
	<div id="userSection">
		<div if={loggedinuserid}>
        <p>Welcome {loggedinuserid}</p>
        <p> <a href="/logout"> Log Out </a></p>
        </div>
        <div if={!loggedinuserid}>
		<p> <a href="{this.opts.auth_url}/ed?apid=appler&apto={this.opts.redirect_uri_path}"> Log In </a></p>
        </div>
    </div>

    <script>
        this.on('mount', function () {
        	console.log('auth >> ', Cookies.get('auth'))
        	this.userLoggedIn = Cookies.get('auth')
        	this.loggedinuserid = Cookies.get('loggedinuserid')
            this.applerac = Cookies.get('applerac')

        	window.app = window.app || {}
        	app.userLoggedIn = this.userLoggedIn
        	app.loggedinuserid = this.loggedinuserid
            app.applerac = this.applerac


            if(app.applerac && this.userLoggedIn){
                $.getJSON('/get_user').done(function (user, success) {
                   this.user = user.user
                   app.user = user.user
                  console.log(' response ', user)
                }).error(function (error, r) {
                   console.error('error ', error)
                })
            }
        	this.update()
        });

    </script>

    <style>
        
    </style>
</usermanagement>