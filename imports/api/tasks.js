import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

var taskTypes = ["dailyCallPrompts", "weeklyCallPrompts"];
var taskCollections = {
    dailyCallPrompts : DailyCallPrompts,
    weeklyCallPrompts : WeeklyCallPrompts
}

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
    
    Meteor.call('users.updateTaskCount', userId);
    if (Meteor.call('users.getTaskCount', userId) >= 2) {
        return false;
    }
    
    // Randomly choose a task type
    IterateRandomStart(taskTypes, (taskType) => {
        foundTaskType = taskType;
        //console.log(taskCollections[taskType].find().fetch());
            IterateRandomStart(taskCollections[taskType].find().fetch(), (task) => {
                // If we found a valid task, break!
                // TODO:  All tasks are valid right now.  Need to filter based on user preference/completion status/date
                if (true) {
                    foundTask = task;
                    fFoundTask = true;
                    return false;
                }
                return true;
            })
        if (fFoundTask) {return false;}
        return true;
    })

    console.log(fFoundTask);

    if (fFoundTask) {
        console.log(foundTask);
        // TODO:  Figure out security model here!  MUST DO THIS BEFORE PUBLIC PUBLISH.
        var userTask = {
            user_id: userId,
            task_type: foundTaskType,
            task_id: foundTask._id._str,
            task_statistics: "TBA",
            given_on: new Date(),
            lasts_until: "TBA",
            is_completed: false,
            never_show_again: false
        }
        console.log(userTask);
        Meteor.call('tasks.createNew', userTask);
        Meteor.call('users.updateTaskCount', userId);
        console.log("nTasks = " + Meteor.call('users.getTaskCount'));
    }
};

Meteor.methods({
    // Create a new task for the given user
    'tasks.createNew'(task) {
        check(task, Match.Any); // TODO:  Make this secure.
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }        
        UserTasks.insert(task);
        return true;
    },
    'tasks.createRandom'(userId) {
        check(userId, String);  // TODO:  Figure out if Uid should be a string or a number.
        if (Meteor.isServer) {
            CreateRandomUserTask(userId);
        }
    }
})