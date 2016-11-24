import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

var taskTypes = ["dailyCallPrompts", "weeklyCallPrompts"];
var taskCollections = {
    dailyCallPrompts : DailyCallPrompts,
    weeklyCallPrompts : WeeklyCallPrompts
}

// Handle publication for tasks.  TODO:  Is this the correct file for this?

if (Meteor.isServer) {
    Meteor.publish('userTasks', function userTasksPublication() {
        return UserTasks.find({ user_id : this.userId });
    });
    Meteor.publish('dailyCallPrompts', function () {
        return DailyCallPrompts.find();
    });
    Meteor.publish('weeklyCallPrompts', function() {
        return WeeklyCallPrompts.find();
    });
    Meteor.publish('nationalSenators', function() {
        return Senators.find();
    })
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

function CreateRandomUserTask(userId) {
    var fFoundTask = false;
    var foundTaskType;
    var foundTask;
    
    Meteor.call('users.updateTaskCount');  //TODO:  Figure out when/where this should be updated.
    if (Meteor.call('users.getTaskCount') >= 2) {
        return false;
    }
    
    // Randomly choose a task type
    IterateRandomStart(taskTypes, (taskType) => {
        foundTaskType = taskType;
        //console.log(taskCollections[taskType].find().fetch());
            IterateRandomStart(taskCollections[taskType].find().fetch(), (task) => {

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
        Meteor.call('users.updateTaskCount');
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
    'tasks.createRandom'() {
        if (Meteor.isServer) {
            CreateRandomUserTask(Meteor.userId());
        }
    }
})