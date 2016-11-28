import { Meteor } from 'meteor/meteor';

import '../imports/api/users.js';
import '../imports/api/tasks.js';

Meteor.startup(() => {
    ServiceConfiguration.configurations.update (
        {service: "facebook"},
        {
            $set : {
                "appId": process.env['FACEBOOK_APP_ID'],
                "secret": process.env['FACEBOOK_SECRET']
            }
        }
    )
});


Accounts.onLogin(function(loginAttempt) {
    var services = null;
    if (loginAttempt.user) { services = loginAttempt.user.services}
    
    if(services && services.facebook) {
        
        // TODO:  check for permissions
        stateDataSource = Meteor.user().profile.stateDataSource
        if (!stateDataSource || stateDataSource == "" || stateDataSource == "facebook") {
            Meteor.http.get("https://graph.facebook.com/v2.8/me?fields=location{location}&access_token=" + services.facebook.accessToken, 
                        function(error, result) {
                            if (!error) {
                                Meteor.call('users.setState', result.data.location.location.state, "facebook")
                            }
                            else {
                                console.log(error)
                            }
                        })
        }
    }
})