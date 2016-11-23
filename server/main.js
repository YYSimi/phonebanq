import { Meteor } from 'meteor/meteor';

import '../imports/api/users.js';
import '../imports/api/tasks.js';

function populateSenators() {
    console.log(Senators.find().count());
}

Meteor.startup(() => {
    populateSenators();

});


Accounts.onLogin(function(loginAttempt) {
    // console.log(loginAttempt)
    
    var services = null;
    if (loginAttempt.user) { services = loginAttempt.user.services}
    
    if(services && services.facebook) {
        
        // TODO:  check for permissions
        
       // console.log(services.facebook);
       Meteor.http.get("https://graph.facebook.com/v2.8/me?fields=location{location}&access_token=" + services.facebook.accessToken, 
                        function(error, result) {
                            if (!error) {
                                console.log(result.data.location.location.state);
                                Meteor.call('users.setState', result.data.location.location.state)
                            }
                            else {
                                console.log(error)
                            }
                        })
    }
})