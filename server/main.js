import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Migrations } from 'meteor/percolate:migrations'
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import '../imports/api/users.js';
import '../imports/api/tasks.js';
import '../imports/api/util.js';
import '../imports/api/userTasks.js';
import '../imports/api/userGroups.js';
import '../imports/api/roles.js';
import '../imports/api/blog.js';
import './migrations.js';

import { ContactPreferences } from '../imports/api/userClasses.js'
import { PopulateLocationFromFacebook, UpdateCongressionalInfo} from '../lib/common.js';
import { PopulateUserTasks, DisableExpiredUserTasks } from './userTasks.js';
import { indexCallbacks } from '../lib/collections.js';
import { Scheduler } from './scheduler.js'

// TODO:  Create a Users class so that we don't have this hanging out here.
var userFbNotificationTokens = {};

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
                    response.data.results.forEach( function(elt) {
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
                    if (nRecordsSoFar < nTotalRecords) {
                        UpdateCongressInfoFromPage(page+1);
                    }
                }
            }
        )
    };
    UpdateCongressInfoFromPage(1);
}

Meteor.startup(() => {
    Migrations.migrateTo(6);
    indexCallbacks.executeCallbacks();
    Houston.add_collection(Meteor.users);
    Houston.add_collection(Migrations._collection); // Adds info about migrations to the houston admin UI.  Hacky!

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
                fbAppInfo.setAccessToken(response.content.split('=')[1]);
            }
        }
    )

    FixActiveUserTaskCount();
    FixTaskCompletionCount();
    runStartupUserTasks();

    const limit = 5;
    const timeRange = 2000;

    DDPRateLimiter.addRule({
        type: 'method',
        name(name) {return true }
    }, limit, timeRange);

    DDPRateLimiter.addRule({
        type: 'subscription',
        name(name) {return true }
    }, limit, timeRange);


    if(IsProductionMode()) 
    {
        Scheduler.registerAction(() => {RunMaintenanceTasks(IsProductionMode())}, 1, "daily")
    }
    else {
        var testModeFrequency = 1000*10;
        Scheduler.createActionGroup("testModeActions", testModeFrequency);
        Scheduler.registerAction(() => {RunMaintenanceTasks(IsProductionMode())}, 1, "testModeActions");
        Scheduler.runScheduler("testModeActions");
    }
    Scheduler.runScheduler("daily");
    Scheduler.runScheduler("weekly");
    Scheduler.runScheduler("monthly");

    RunMaintenanceTasks(IsProductionMode()); 
});

Accounts.onCreateUser(function (options, user) {
    if (!user.profile) {user.profile = {};}
    user.profile.loginSource = findLoginSource(user);
    user.username = generateUsername(user);
    user.profile.contactPreferences = generateDefaultContactPreferences(user);
    return user;
});

Accounts.onLogin(function(loginAttempt) {
    if (!loginAttempt.user) { return; }
    var loginSource = findLoginSource(loginAttempt.user);

    var user = loginAttempt.user;
    var services = loginAttempt.user.services;

    // Populate the User's location data
    if(loginSource === "facebook") {
        // TODO:  check for permissions
        locationDataSource = loginAttempt.user.profile.locationDataSource
        if (!locationDataSource || locationDataSource === "" || locationDataSource === "facebook") {
            PopulateLocationFromFacebook(services.facebook.accessToken);
        }
    }

    // Generate a username if needed
    // TODO:  Remove this code once we go into beta.
    if (!user.username) {
        Meteor.users.update(user._id, {$set: {username: generateUsername(user) } } );
    }

    UpdateCongressionalInfo(loginAttempt.user);

    if (!loginAttempt.user.profile || !loginAttempt.user.profile.fHasLoggedInBefore) {
        OnFirstLogin(loginAttempt.user);
        Meteor.users.update(
            { _id: loginAttempt.user._id },
            { $set: { "profile.fHasLoggedInBefore" : true } })
    }

    // Update the user's task list.
    DisableExpiredUserTasks(loginAttempt.user._id);

    Meteor.users.update(loginAttempt.user._id, { $set: {"profile.loginSource": loginSource}} )
});

function runStartupUserTasks() {
    Meteor.users.find().forEach((user) => {
        ScheduleFbNotification(user);
    })
}

function findLoginSource(user) {
    var retval = "local"
    if (user.services && user.services.facebook) {
        retval = "facebook";
    }
    return retval;
}

function generateDefaultContactPreferences(user) {
    var userEmailAddress = "";
    if (user.emails && user.emails[0] && user.emails[0].address) {
        userEmailAddress = user.emails[0].address;
    }
    else if (user.services && user.services.facebook && user.services.facebook.email) {
        userEmailAddress = user.services.facebook.email;
    }
    var defaultSettings = new ContactPreferences(
        true,
        1,
        "daily",
        (user.profile && user.profile.loginSource === "facebook") ? true : false, // fUseFacebokForRecurring
        false, // fUseEmailForRecurring
        true, // fMajorEventNotify
        (user.profile && user.profile.loginSource === "facebook") ? true : false, // fUseFacebookForMajor
        true, // fUseEmailForMajor
        userEmailAddress // emailAddress
    )
    return defaultSettings;
}

function generateUsername(user) {
    var loginSource = user.profile.loginSource;
    var username = "";

    // User already has a name.  Just make it lowercase and return.
    if (user.username) {
        return user.username.toLowerCase();
    }

    // Need to generate a name for the user, since they're using an external login source.
    switch (loginSource) {
        case "facebook":
            if (user.services && user.services.facebook && user.services.facebook.name) {
                username = user.services.facebook.name.toLowerCase().trim().replace(" ", "");
            }
            else {
                throw "Attempted to generate username for invalid facebook user"
            }
            break;
        case "local":
            if (user.emails && user.emails[0] && user.emails[0].address) {
                username = user.emails[0].address.split("@")[0];
            }
            else {
                throw "Attempted to generate username for invalid local user"
            }
            break;
        default:
            throw "Attempted to generate a username without specifying a loginsource";
    }

    count = Meteor.users.find({username: username}).count();
    if (count === 0) {
        return username;
    }
    else {
        return username + (count + 1);
    }
    
}

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
        Tasks.update(userTask.task_id, {$inc: {"statistics.completion_count": 1}})
    })
}

function ScheduleFbNotification(user) {
    if (user.profile && user.profile.contactPreferences) {
        var prefs = user.profile.contactPreferences;
        if (userFbNotificationTokens[user._id]) {
            Scheduler.unregisterAction(user._id);
        }
        if (prefs.fRecurringNotify && prefs.fUseFacebookForRecurring) {
            var token = Scheduler.registerAction(
                () => {NotifyFacebookUser(user);},
                prefs.notifyPeriod,
                prefs.notifyPeriodType);
            userFbNotificationTokens[user._id] = token;
        }
    }
}

// Schedule a job to update the userTask database once per day.
function UpdateAllUserTasks(){
    console.log("updating all user tasks");
    Meteor.users.find().forEach(function(user) {
        console.log("updating user tasks for " + user._id);
        DisableExpiredUserTasks(user._id);
        var nNewTasksCreated = PopulateUserTasks(user._id);
        console.log("Created " + nNewTasksCreated + " new Tasks");
    })
}

function OnFirstLogin(user) {
    var nNewTasksCreated = PopulateUserTasks(user._id);
    if (user.services && user.services.facebook) {
        NotifyFacebookUser(user);
    }
}

function NotifyFacebookUser(user) {
    var accessToken = fbAppInfo.getAccessToken();
    if (user.services && user.services.facebook && accessToken) {
        userFbInfo = user.services.facebook;

        // TODO:  This isn't always displaying the "most important" task given today.
        var latestUserTaskCursor = UserTasks.find({user_id: user._id, is_active:true}, {sort: {given_on : -1, priority:-1,} });
        
        if (latestUserTaskCursor.count() > 0) {
            var latestUserTask = latestUserTaskCursor.fetch()[0];
            latestTask = Tasks.findOne(latestUserTask.task_id);

            if (latestTask) {
                var fbMaxMessageLength=180;
                var notificationMessage = latestTask.brief_description;
                if (notificationMessage.length > fbMaxMessageLength) {
                    notificationMessage = notificationMessage.substring(0, fbMaxMessageLength - 3) + '...'
                }

                httpRequestStr='https://graph.facebook.com/' +
                    userFbInfo.id +  '/notifications' +
                    "?access_token=" + fbAppInfo.getAccessToken() +
                    "&href=/userDashboard" +
                    "&template=" + notificationMessage;
                    httpRequestStr = encodeURI(httpRequestStr);
                
                HTTP.post(httpRequestStr, {}, function (error, response) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                    }
                });
            }
        }
    }
}