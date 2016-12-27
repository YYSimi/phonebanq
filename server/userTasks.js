import { getStateGroupByStateAbbr, getNationalGroup } from '../lib/common.js';

//  Iterates over an array starting at a random index.
//  Action should be a function that takes an array element and returns true to continue iteration, false to break.

function IterateRandomStart(array, action) {
    // TODO: Restore randomization functionality.  Removed for now so that we can give tasks in priority order.
    idxInitial = 0;
    //var idxInitial = Math.floor(Math.random()*array.length);
    var idxCurrent = idxInitial;
    
    do {
        if (action(array[idxCurrent])) {
            idxCurrent += 1;
            idxCurrent = idxCurrent % array.length;
        }
        else {break;}
    } while (idxCurrent != idxInitial);
   
};

function CreateRandomUserTask(userId, group) {
    var fFoundTask = false;
    var foundTaskType;
    var foundTask;
        
    //TODO:  Standardize storing groupId as MongoID!
    var tasksCursor = Tasks.find( {is_disabled : { $ne: true }, group: group._id._str },
                                  {sort : {priority:-1}});

    if (tasksCursor.count() > 0) {
        // TODO:  Don't use an array.  .fetch() will have awful performance characteristics when your DB gets large.
        // TODO:  Return only tasks in the appropriate date range.
        IterateRandomStart(tasksCursor.fetch(), (task) => {
            var existingTask = UserTasks.findOne( { user_id : userId, task_id: task._id._str } );
            // If we found a valid task, break!
            if (!existingTask) {
                foundTask = task;
                fFoundTask = true;
                return false;
            }
            return true;
        })
    }

    if (fFoundTask) {
        console.log("Creating task for user " + userId);
        console.log(fFoundTask);

        var today = new Date();
        today.setUTCHours(0,0,0,0);
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
            never_show_again: false,
            group_id: groupId
        }
        console.log(userTask);
        UserTasks.insert(userTask);
        Meteor.users.update(userId, {$inc: {"statistics.activeTasks":1}});
    }
    
    return fFoundTask;
};


export function PopulateUserTasks(userId) {
  //  PopulateUserTasksForGroup(userId, getNationalGroup());
    user = Meteor.users.findOne(userId);
    console.log(user);
    if (user && user.profile && user.profile.state) {
        PopulateUserTasksForGroup(userId, getStateGroupByStateAbbr(user.profile.state));
    }
}

function PopulateUserTasksForGroup(userId, group) {
    if (!group) {
        console.log("Invalid group specified"); // TODO:  Look up server-side error handling!
        return;
    }
    console.log("Populating " + group.name + " (" + group._id + ")" + " tasks for user " + userId);
    DisableExpiredUserTasks(userId);
    var nTasksCreated = 0;
    var nTasksMax = 2;
    currentTaskCount = UserTasks.find({user_id: userId, is_active: true, group_id: group._id}).count();

    // Attempt to create new tasks until we hit the task creation limit or task creation fails.
    while (nTasksCreated + currentTaskCount < nTasksMax) {
        if (!CreateRandomUserTask(userId, group)) {
            break
        }
        ++nTasksCreated;
    }

    return nTasksCreated;
}


export function DisableExpiredUserTasks(userId) {
    // Mark any expired active tasks as inactive
    var expiredTaskCutoffDate = new Date();
    var nTasksMarkedInactive = 0;
    
    activeExpired = UserTasks.find({
        user_id: userId,
        is_active: true,
        lasts_until : { $lt : new Date() }
    });

    activeExpired.forEach( function (item) {
        UserTasks.update(item._id, { $set: {is_active : false} });
        ++nTasksMarkedInactive;
    });

    // Purge old tasks that are inactive, non-completed, and non-"never show again"
    var oldTaskCutoffDate = new Date();
    var nTaskRetryDelayDays = 3;
    oldTaskCutoffDate.setDate(oldTaskCutoffDate.getDate()-nTaskRetryDelayDays);
    UserTasks.remove({
        user_id: userId,
        is_active: false,
        is_completed: false,
        is_repeatable: false,
        never_show_again: false,
        lasts_until : { $lt : oldTaskCutoffDate }
    });

    Meteor.users.update(userId, {$inc: {"statistics.activeTasks" : 0 - nTasksMarkedInactive}})
}