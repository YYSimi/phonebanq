import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

var taskTypes = ["dailyCallPrompts", "weeklyCallPrompts"];
var taskCollections = {
    dailyCallPrompts : DailyCallPrompts,
    weeklyCallPrompts : WeeklyCallPrompts
}

//  Iterates over an array starting at a random index.
//  Action should be a function that takes an array element and returns true to continue iteration, false to break.

function iterateRandomStart(array, action) {
    var idxInitial = Math.floor(Math.random()*array.length);
    var idxCurrent = idxInitial;
    
    do {
        if (action(array[idxCurrent])) {
            idxCurrent += 1;
            idxCurrent = idxCurrent % array.length;
        }
        else {break;}
    } while (idxCurrent != idxInitial);
   
}

Meteor.methods({
    // Create a new task for the given user
    'tasks.createNew'(userId) {
        // Randomly choose a task type
        iterateRandomStart(taskTypes, (taskType) => {
            console.log(taskCollections[taskType].find().fetch());
            return true;
        })
        
        
        // Randomly choose a task of that type
        
        // If no valid tasks of that type exist, try another type
        
        // If all task types are exhausted, give up.
        return false;
    }
})