import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

import './myTasks.html'
import '../../api/tasks.js'

// TODO:  Put this in a central location.
var taskTypes = ["dailyCallPrompts", "weeklyCallPrompts"];
var taskCollections = {
    dailyCallPrompts : DailyCallPrompts,
    weeklyCallPrompts : WeeklyCallPrompts
}

Template.myTasks.helpers({
    getTasks() {
        console.log("Returning all tasks for uid" + Meteor.userId());
        var result = UserTasks.find({ user_id: Meteor.userId() });
        console.log(result);
        return result;
    }
})

Template.oneTask.helpers({
    taskInfo() { 
        console.log(this);
        
        //TODO:  Make this OO-ified
        switch (this.task_type) {
            case "dailyCallPrompts":
                console.log(taskCollections[this.task_type]);
                return DailyCallPrompts.findOne(new Mongo.ObjectID(this.task_id)).supporter_script;
            case "weeklyCallPrompts":
                console.log(taskCollections[this.task_type]);
                return taskCollections[this.task_type].findOne(new Mongo.ObjectID(this.task_id)).Script;
        }
    }
})