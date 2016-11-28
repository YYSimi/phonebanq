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
    UpdateAllUserTasks();
    var fnSetUpdateTimer = function () {
        var midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMinutes(0);
        var timeUntilMidnight = (midnight.getTime() - new Date().getTime())
        Meteor.setTimeout(
            function() { UpdateAllUserTasks(); fnSetUpdateTimer() }, 
            timeUntilMidnight)
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

    // Update the user's task list.

    UpdateUserTasks(loginAttempt.user._id);

})

// TODO:  This code is duplicated in imports/ui/main.js.  Get rid of that dupe!

function UpdateUserTasks(userId) {
    // Mark any expired active tasks as inactive
    var expiredTaskCutoffDate = new Date();
    activeExpired = UserTasks.find({
        user_id: userId,
        is_active: true,
        lasts_until : { $lt : new Date() }
    });

    activeExpired.forEach( function (item) {
        item.is_active = false;
    });

    // Purge old tasks that are non-active, non-completed, and non-"never show again"
    var oldTaskCutoffDate = new Date();
    var nTaskRetryDelayDays = 3;
    oldTaskCutoffDate.setDate(oldTaskCutoffDate.getDay() - nTaskRetryDelayDays);
    UserTasks.remove({
        user_id: userId,
        is_completed: false,
        is_repeatable: false,
        never_show_again: false,
        lasts_until : { $lt : oldTaskCutoffDate }
    });
}

// Schedule a job to update the userTask database once per day.
function UpdateAllUserTasks(){
    console.log("updating all user tasks");
    Meteor.users.find().forEach(function(user) {
        console.log("updating user tasks for " + user._id);
        UpdateUserTasks(user._id);
    })
}
