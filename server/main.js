import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import '../imports/api/users.js';
import '../imports/api/tasks.js';
import '../imports/api/util.js';
import '../imports/api/userTasks.js';

import { PopulateLocationFromFacebook, UpdateCongressionalInfo} from '../lib/common.js';
import { PopulateUserTasks, DisableExpiredUserTasks } from './userTasks.js';

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
    // TODO:  Figure out how to enforce the constraint of priority \in [1, 5].
    Tasks.find().forEach(function(task) {
        if (task.priority > 1) {
            Tasks.update(task._id, {$set : {priority: task.priority - 1} })
        }
    })    
}

function UpdateCongressInfo() {
    var httpRequestStrBase = "https://congress.api.sunlightfoundation.com/legislators"
    var nRecordsPerPage = 10;
    var httpRequestStr = httpRequestStrBase + "?per_page=" + nRecordsPerPage;
    httpRequestStr = encodeURI(httpRequestStr);

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

    FixActiveUserTaskCount();
    FixTaskCompletionCount();
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
    var loginSource = "local";
    if (!loginAttempt.user) { return; }

    var services = loginAttempt.user.services;

    // Populate the User's location data
    if(services && services.facebook) {
        loginSource = "facebook";
        // TODO:  check for permissions
        locationDataSource = loginAttempt.user.profile.locationDataSource
        if (!locationDataSource || locationDataSource == "" || locationDataSource == "facebook") {
            PopulateLocationFromFacebook(services.facebook.accessToken);
        }
    }

    UpdateCongressionalInfo(loginAttempt.user);


    if (!loginAttempt.user.profile || !loginAttempt.user.profile.fHasLoggedInBefore) {
        OnFirstLogin(loginAttempt.user._id);
        Meteor.users.update(
            { _id: loginAttempt.user._id },
            { $set: { "profile.fHasLoggedInBefore" : true } })
    }

    // Update the user's task list.
    DisableExpiredUserTasks(loginAttempt.user._id);

    Meteor.users.update(loginAttempt.user._id, { $set: {"profile.loginSource": loginSource}} )
})

// This function is a maintenance task for a checkin that messed up the active task count in the DB.
// Keeping it here in case it happens again, but it A)  Should't be called anywhere in production 
// and B)  Should be moved to a maintenance script that only deals with the DB.
function FixActiveUserTaskCount() {
    Meteor.users.find().forEach(function(user) {
        console.log("Fixing user task count for user " + user._id);
        nActiveTasks =  UserTasks.find({
                            user_id: user._id,
                            is_active: true
                        }).count();
        Meteor.users.update(
            user._id,
            { $set: {"statistics.activeTasks": nActiveTasks} } 
        )
    })
}

// Another maintenance script, this time to make sure task completion counts are correct
function FixTaskCompletionCount() {
    // Set all completion counters to 0
    Tasks.find().forEach(function(task) {
        Tasks.update(task._id, {$set: {"statistics.completion_count": 0} })   
    });
    // Increment appropriate completion counter by 1 for each completed user task
    UserTasks.find({is_completed: true}).forEach(function(userTask) {
        Tasks.update(new Mongo.ObjectID(userTask.task_id), {$inc: {"statistics.completion_count": 1}})
    })
}

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

        // TODO:  This isn't always displaying the "most important" task given today.
        var latestUserTaskCursor = UserTasks.find({user_id: user._id, is_active:true}, {sort: {given_on : -1, priority:-1,} });
        
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
                    httpRequestStr = encodeURI(httpRequestStr);
                
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