import { Meteor } from 'meteor/meteor';

import '../imports/api/users.js';
import '../imports/api/tasks.js';
import { PopulateUserTasks, UpdateUserTasks } from '../lib/common.js'

Meteor.startup(() => {
    Houston.add_collection(Meteor.users);

    ServiceConfiguration.configurations.update (
        {service: "facebook"},
        {
            $set : {
                "appId": process.env['FACEBOOK_APP_ID'],
                "secret": process.env['FACEBOOK_SECRET']
            }
        }
    )
    UpdateAllUserTasks();
    var fnSetUpdateTimer = function () {
        var midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMinutes(0);
        var timeUntilMidnight = (midnight.getTime() - new Date().getTime())
        Meteor.setTimeout(
            function() { 
                UpdateAllUserTasks(); 
                fnSetUpdateTimer() }, 
//            timeUntilMidnight)
                1000*10);
        }
    fnSetUpdateTimer();
});


Accounts.onLogin(function(loginAttempt) {
    var services = null;
    if (!loginAttempt.user) { return; }
    
    services = loginAttempt.user.services;

    // Populate the User's location data
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

    // TODO:  Figure out when "profile" gets populated
    // TODO:  Figure out best practices for querying javascript objects that may be null. 
    if (!Meteor.user().profile || Meteor.user().profile.fHasLoggedInBefore) {
        OnFirstLogin(Meteor.userId());
        Meteor.users.update(
            { _id: Meteor.userId() },
            { $set: { "profile.fHasLoggedInBefore" : true } })
    }

    // Update the user's task list.
    UpdateUserTasks(loginAttempt.user._id);
})

// Schedule a job to update the userTask database once per day.
function UpdateAllUserTasks(){
    console.log("updating all user tasks");
    Meteor.users.find().forEach(function(user) {
        console.log("updating user tasks for " + user._id);
        UpdateUserTasks(user._id);
        PopulateUserTasks(user._id);
    })
}

function OnFirstLogin(userId) {
    console.log("running OnFirstLogin");
    UpdateUserTasks(userId);
    PopulateUserTasks(userId);
}