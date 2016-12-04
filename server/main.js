import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import '../imports/api/users.js';
import '../imports/api/tasks.js';
import { PopulateUserTasks, UpdateUserTasks, PopulateLocationFromFacebook, GetCongressionalInfo} from '../lib/common.js';

var fbAppInfo = function(){
    var fbAppAccessToken = '';
    
    return {
        getAccesstoken() {return fbAppAccessToken},
        setAccessToken(token) {fbAppAccessToken = token}
    };
}();

Meteor.startup(() => {
    Houston.add_collection(Meteor.users);

    var fbLocalhostAppId = '332532203786554';
    var fbLocalhostSecret = '8b3e5e818c702c199a429e5c7e96311a';

    // If the environment gives override values (i.e. real values) for appID/secret, use those.
    // Otherwise, use appID/secret for localhost.
    var fbAppId = process.env['FACEBOOK_APP_ID'] || fbLocalhostAppId;
    var fbSecret = process.env['FACEBOOK_SECRET'] || fbLocalhostSecret;

    ServiceConfiguration.configurations.update (
        {service: "facebook"},
        {
            $set : {
                "appId": fbAppId,
                "secret": fbSecret,
            }
        }
    )

    httpRequestStr='https://graph.facebook.com/oauth/access_token' +
            "?client_id=" + fbAppId +
            "&client_secret=" + fbSecret +
            "&grant_type=client_credentials";

    HTTP.get(httpRequestStr, 
        function(error, response) { 
            if (error) {
                console.log( error );
            }
            else {
                console.log( response );
                fbAppInfo.setAccessToken(response.content.split('=')[1]);
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
    
    // TODO:  Are we calling this too often?
    GetCongressionalInfo(loginAttempt.user);

    services = loginAttempt.user.services;

    // Populate the User's location data
    if(services && services.facebook) {
        
        // TODO:  check for permissions
        locationDataSource = Meteor.user().profile.locationDataSource
        if (!locationDataSource || locationDataSource == "" || locationDataSource == "facebook") {
            PopulateLocationFromFacebook(services.facebook.accessToken);
            GetCongressionalInfo(loginAttempt.user);
        }
    }

    // TODO:  Figure out when "profile" gets populated
    // TODO:  Figure out best practices for querying javascript objects that may be null.
    if (!Meteor.user().profile || !Meteor.user().profile.fHasLoggedInBefore) {
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
        var nNewTasksCreated = PopulateUserTasks(user._id);
        if (nNewTasksCreated > 0) {
            if (user.services && user.services.facebook) {
                NotifyFacebookUser(user);
            }
        }
    })
}

function OnFirstLogin(userId) {
    console.log("running OnFirstLogin");
    UpdateUserTasks(userId);
    var nNewTasksCreated = PopulateUserTasks(userId);
    if (nNewTasksCreated > 0) {
        if (user.services && user.services.facebook) {
            NotifyFacebookUser(user);
        }
    }
}

// TODO:  Make sure we've generated the app access token before sending this out.'
function NotifyFacebookUser(user) {
    console.log(user);
    userFbInfo = user.services.facebook;

    var latestUserTaskCursor = UserTasks.find({user_id: user._id, is_active:true}, {sort: {given_on : -1} });
    if (latestUserTaskCursor.count() > 0) {
        var latestUserTask = latestUserTaskCursor.fetch()[0];
        latestTask = Tasks.findOne(new Mongo.ObjectID(latestUserTask.task_id));

        if (latestTask) {
            //TODO:  Make sure that the notification message is not longer than 180 characters.
            var notificationMessage = latestTask.brief_description + "."

            httpRequestStr='https://graph.facebook.com/' +
                userFbInfo.id +  '/notifications' +
                "?access_token=" + fbAppInfo.getAccesstoken() +
                "&href=/myTasks" +
                "&template=" + notificationMessage;

            HTTP.post(httpRequestStr, {}, function (error, response) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log(response);
                }
            });
        }
    }
}