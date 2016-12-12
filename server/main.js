import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import '../imports/api/users.js';
import '../imports/api/tasks.js';
import { PopulateLocationFromFacebook, GetCongressionalInfo} from '../lib/common.js';
import { PopulateUserTasks, DisableExpiredUserTasks } from './userTasks.js'

var fbAppInfo = function(){
    var fbAppAccessToken = '';
    
    return {
        getAccessToken() {return fbAppAccessToken},
        setAccessToken(token) {fbAppAccessToken = token}
    };
}();

function IsProductionMode() {
    return (process.env['DEPLOYMENT_TYPE'] == "production")
}

function RunMaintenanceTasks(fRunExpensiveTasks) {
    UpdateAllUserTasks();

    // RunMaintenanceTasks is called frequently for debug purposes.  Put any
    // tasks that you don't want running multiple times per minute on pre-production servers here. 
    if (fRunExpensiveTasks) {
        UpdateCongressInfo();
    }

    // Drop the priority of all tasks by 1
    // TODO:  Figure out how to enforce the constraint of priority \in [0, 5].
    Tasks.find().forEach(function(task) {
        if (task.priority > 0) {
            Tasks.update(task._id, {$set : {priority: task.priority - 1} })
        }
    })    
}

function UpdateCongressInfo() {
    var httpRequestStrBase = "https://congress.api.sunlightfoundation.com/legislators"
    var nRecordsPerPage = 10;
    var httpRequestStr = httpRequestStrBase + "?per_page=" + nRecordsPerPage;

    var UpdateCongressInfoFromPage = function (page) {
        HTTP.get(httpRequestStr + "&page=" + page,
            function (error, response) {
                if (error) {
                    nTotalRecords = 0;
                    console.log(error);
                }
                else {
                    console.log("got response");
                    console.log(response);

                    response.data.results.forEach( function(elt) {
                        console.log("Scanning congressperson " + elt.first_name + " " + elt.last_name);
                        if (elt.chamber === "house") {
                            var storedRepresentative = Representatives.findOne( {bioguide_id: elt.bioguide_id} );
                            if (storedRepresentative) {
                                Representatives.update(storedRepresentative._id, elt);
                            } 
                            else {
                                Representatives.insert(elt);
                            }
                        }
                        if (elt.chamber === "senate") {
                            var storedSenator = Senators.findOne( {bioguide_id: elt.bioguide_id });
                            if (storedSenator) {
                                Senators.update(storedSenator._id, elt);
                            }
                            else {
                                Senators.insert(elt);
                            }
                        }
                    });

                    var nTotalRecords = response.data.count;
                    var nRecordsSoFar = nRecordsPerPage * page;
                    console.log("total records: " + nTotalRecords);
                    console.log("records so far: " + nRecordsSoFar);
                    if (nRecordsSoFar < nTotalRecords) {
                        console.log("getting next page!")
                        UpdateCongressInfoFromPage(page+1);
                    }
                }
            }
        )
    };
    UpdateCongressInfoFromPage(1);
}

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
    var fnSetMaintenanceTimer = function () {
        var midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMinutes(0);
        var timeUntilMidnight = (midnight.getTime() - new Date().getTime())
        var periodicTaskDelta = 1000*10;
        var timeToNextTask = IsProductionMode() ? timeUntilMidnight : periodicTaskDelta; 

        Meteor.setTimeout(
            function() { 
                RunMaintenanceTasks(IsProductionMode()); // Run all maintenance tasks in production mode.  Don't run expensive tasks in debug mode.
                fnSetMaintenanceTimer()
            }, 
            timeToNextTask);
    }
    fnSetMaintenanceTimer();

    RunMaintenanceTasks(IsProductionMode()); 
});

Accounts.onLogin(function(loginAttempt) {
    var services = null;
    if (!loginAttempt.user) { return; }
    
    GetCongressionalInfo(loginAttempt.user);

    services = loginAttempt.user.services;

    // Populate the User's location data
    if(services && services.facebook) {
        
        // TODO:  check for permissions
        locationDataSource = loginAttempt.user.profile.locationDataSource
        if (!locationDataSource || locationDataSource == "" || locationDataSource == "facebook") {
            PopulateLocationFromFacebook(services.facebook.accessToken);
            GetCongressionalInfo(loginAttempt.user);
        }
    }

    if (!loginAttempt.user.profile || !loginAttempt.user.profile.fHasLoggedInBefore) {
        OnFirstLogin(loginAttempt.user._id);
        Meteor.users.update(
            { _id: loginAttempt.user._id },
            { $set: { "profile.fHasLoggedInBefore" : true } })
    }

    // Update the user's task list.
    DisableExpiredUserTasks(loginAttempt.user._id);
})

// Schedule a job to update the userTask database once per day.
function UpdateAllUserTasks(){
    console.log("updating all user tasks");
    Meteor.users.find().forEach(function(user) {
        console.log("updating user tasks for " + user._id);
        DisableExpiredUserTasks(user._id);
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
    var nNewTasksCreated = PopulateUserTasks(userId);
    if (nNewTasksCreated > 0) {
        if (user.services && user.services.facebook) {
            NotifyFacebookUser(user);
        }
    }
}

function NotifyFacebookUser(user) {
    var accessToken = fbAppInfo.getAccessToken();
    if (accessToken) {
        console.log("notifying user");
        console.log(user);
        userFbInfo = user.services.facebook;

        var latestUserTaskCursor = UserTasks.find({user_id: user._id, is_active:true}, {sort: {given_on : -1} });
        if (latestUserTaskCursor.count() > 0) {
            var latestUserTask = latestUserTaskCursor.fetch()[0];
            latestTask = Tasks.findOne(new Mongo.ObjectID(latestUserTask.task_id));

            if (latestTask) {
                var fbMaxMessageLength=180;
                var notificationMessage = latestTask.brief_description;
                if (notificationMessage.length > fbMaxMessageLength) {
                    notificationMessage = notificationMessage.substring(0, fbMaxMessageLength - 3) + '...'
                }

                httpRequestStr='https://graph.facebook.com/' +
                    userFbInfo.id +  '/notifications' +
                    "?access_token=" + fbAppInfo.getAccessToken() +
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
}