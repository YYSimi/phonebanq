import { HTTP } from 'meteor/http';

// Code needed on both the client and the server goes here.

// TODO:  Split this into multiple files

//  Iterates over an array starting at a random index.
//  Action should be a function that takes an array element and returns true to continue iteration, false to break.

function IterateRandomStart(array, action) {
    var idxInitial = Math.floor(Math.random()*array.length);
    var idxCurrent = idxInitial;
    
    do {
        if (action(array[idxCurrent])) {
            idxCurrent += 1;
            idxCurrent = idxCurrent % array.length;
        }
        else {break;}
    } while (idxCurrent != idxInitial);
   
};

export function CreateRandomUserTask(userId) {
    var fFoundTask = false;
    var foundTaskType;
    var foundTask;
    var nMaxActiveTasks = 4;
    
    UpdateTaskCount(userId)  //TODO:  Figure out when/where this should be updated.
    if (GetTaskCount(userId) >= nMaxActiveTasks) {
        return false;
    }
    
    console.log("Creating random Tasks");

    // TODO:  Return only tasks in the appropriate date range.
    IterateRandomStart(Tasks.find().fetch(), (task) => {
        var existingTask = UserTasks.findOne( { user_id : userId, task_id: task._id._str } );
        console.log("Checking for Existing task");
        console.log(existingTask);
        // If we found a valid task, break!
        // TODO:  Never returns duplicates right now.  Need to filter based on preference/completion status/date as well.
        if (!existingTask) {
            foundTask = task;
            fFoundTask = true;
            return false;
        }
        return true;
    })

    console.log(fFoundTask);

    if (fFoundTask) {
        console.log(foundTask);
        var today = new Date();
        today.setUTCHours(0,0,0,0);   // TODO:  Consider moving off of UTC?
        var tomorrow = new Date(today);
        tomorrow.setUTCHours(23, 59, 59, 999)
        var userTask = {
            user_id: userId,
            task_type: foundTaskType,
            task_id: foundTask._id._str,
            task_statistics: "TBA",
            given_on: new Date(),
            lasts_until: tomorrow,
            is_active : true,
            is_completed: false,
            is_repeatable: false,
            never_show_again: false
        }
        console.log(userTask);
        UserTasks.insert(userTask);
        UpdateTaskCount(userId);
    }
};

export function UpdateTaskCount(userId) {
    Meteor.users.update(
        { _id: userId },
        { $set: { "statistics.activeTasks" : UserTasks.find({ user_id: userId, is_active:true}).count() } }
    );
}

export function GetTaskCount(userId) {
    taskCount = Meteor.users.findOne(userId).statistics.activeTasks;
    if (!taskCount) {taskCount = 0;}
    return taskCount;
}

export function UpdateUserTasks(userId) {
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

    // Count how many tasks are now active, and update the user's task count.
    UpdateTaskCount(userId);
}

export function PopulateUserTasks(userId) {
    UpdateUserTasks(userId);
    nTasksCreated = 0;
    taskCount = Meteor.users.findOne(userId).statistics.activeTasks;
    if (taskCount == 1)  { //TODO:  Get rid of this ugly logic
        CreateRandomUserTask(userId);
        nTasksCreated = 1;
    }
    if (taskCount == 0) {
        CreateRandomUserTask(userId);
        CreateRandomUserTask(userId);
        nTasksCreated = 2;
    }

    return nTasksCreated;
}

// TODO:  This is only actually needed on the server, but we need it in two different places, including a meteor Method.
//        Should probably move this to a different file.
// TODO:  Looks like FB doesn't expose info like zip code and street address. Figure out how to handle this.
export function PopulateLocationFromFacebook(userAccessToken) {
    Meteor.http.get("https://graph.facebook.com/v2.8/me?fields=location{location}&access_token=" + userAccessToken, 
        function(error, result) {
            if (!error) {
                if (result.data && result.data.location && result.data.location.location) {
                    var loc = result.data.location.location;
                    if (loc.state) { Meteor.call('users.setState', result.data.location.location.state); }
                    if (loc.longitude) { Meteor.call('users.setLongitude', result.data.location.location.longitude); }
                    if (loc.latitude) { Meteor.call('users.setLatitude', result.data.location.location.latitude); }
                }
            }
            else {
                console.log(error)
            }
        }
    )
}

export function GetCongressionalInfo(user) {
    console.log("Getting congressional info for user ")
    console.log(user);

    if (!user || !user.profile) {
        return;
    }

    var httpRequestStrBase = "https://congress.api.sunlightfoundation.com/legislators/locate"
    var httpRequestStr = ""

    // TODO:  Make sure that the user can override this!
    if (user.profile.latitude && user.profile.longitude) {
        httpRequestStr = httpRequestStrBase + '?latitude=' + user.profile.latitude + '&longitude=' + user.profile.longitude;
    }
    else if (user.profile.zipCode) {
        httpRequestStr = httpRequestStrBase + '?zip=' + user.profile.zipCode;
    }

    if (httpRequestStr) {
        HTTP.get(httpRequestStr,
            function (error, response) {
                if (error) {
                    console.log(error);  //TODO:  Figure out how to properly log and handle errors.
                }
                else {
                    var congressInfo = {
                        house : [],
                        senate : []
                    }
                    response.data.results.forEach( function(elt) {
                        if (elt.chamber === "house") {
                            congressInfo.house.push(elt.bioguide_id);
                            var storedRepresentative = Representatives.findOne( {buiguide_id: elt.buiguide_id} );
                            if (storedRepresentative) {
                                Representatives.update(storedRepresentative._id, elt);
                            } 
                            else {
                                Representatives.insert(elt);
                            }
                        }
                        if (elt.chamber === "senate") {
                            congressInfo.senate.push(elt.bioguide_id);
                            var storedSenator = Senators.findOne( {bioguide_id: elt.bioguide_id });
                            if (storedSenator) {
                                Senators.update(storedSenator._id, elt);
                            }
                            else {
                                Senators.insert(elt);
                            }
                        }
                    });

                    Meteor.users.update(
                        { _id: user._id},
                        { $set: {"profile.congressInfo" : congressInfo} });
                }
            }
        )
    }
}