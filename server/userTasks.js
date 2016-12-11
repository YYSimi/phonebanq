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

export function CreateRandomUserTask(userId) {
    var fFoundTask = false;
    var foundTaskType;
    var foundTask;
    
    console.log("Creating random Tasks");
    var tasksCursor = Tasks.find( {is_disabled : { $ne: true } }, {sort : {priority:-1}});

    if (tasksCursor.count() > 0) {
        // TODO:  Don't use an array.  .fetch() will have awful performance characteristics when your DB gets large.
        // TODO:  Return only tasks in the appropriate date range.
        IterateRandomStart(tasksCursor.fetch(), (task) => {
            var existingTask = UserTasks.findOne( { user_id : userId, task_id: task._id._str } );
            // If we found a valid task, break!
            // TODO:  Never returns duplicates right now.  Need to filter based on preference/completion status/date as well.
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
        Meteor.users.update(userId, {$inc: {"statistics.activeTasks":1}});
    }
    
    return fFoundTask;
};

export function PopulateUserTasks(userId) {
    DisableExpiredUserTasks(userId);
    var nTasksCreated = 0;
    var nTasksMax = 2;
    currentTaskCount = Meteor.users.findOne(userId).statistics.activeTasks;

    // Attempt to create new tasks until we hit the task creation limit or task creation fails.
    while (nTasksCreated + currentTaskCount < nTasksMax) {
        if (!CreateRandomUserTask(userId)) {
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
        --nTasksMarkedInactive;
    });

    // Purge old tasks that are inactive, non-completed, and non-"never show again"
    var oldTaskCutoffDate = new Date();
    var nTaskRetryDelayDays = 3;
    oldTaskCutoffDate.setDate(oldTaskCutoffDate.getDay() - nTaskRetryDelayDays);
    var nTasksRemoved = UserTasks.remove({
        user_id: userId,
        is_completed: false,
        is_repeatable: false,
        never_show_again: false,
        lasts_until : { $lt : oldTaskCutoffDate }
    });

    Meteor.users.update(userId, {$inc: {"statistics.activeTasks" : 0 - nTasksRemoved - nTasksMarkedInactive}})
}