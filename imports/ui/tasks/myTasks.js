import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import './myTasks.html'
import '../../api/tasks.js'


// TODO:  Is this the right place to do the subscription?
Template.myTasks.onCreated(function () {
    Meteor.subscribe('userTasks');
    Meteor.subscribe('dailyCallPrompts');
    Meteor.subscribe('weeklyCallPrompts');
});
Template.myTasks.helpers({
    getTasks() {
        var tasks = UserTasks.find({ user_id: Meteor.userId() });
        console.log("Found " + tasks.count() + " tasks for uid" + Meteor.userId());
        
        return tasks.map(task => {
            switch (task.task_type) {
                case "dailyCallPrompts":
                    return {
                        info: DailyCallPrompts.findOne(new Mongo.ObjectID(task.task_id)).supporter_script
                    };
                case "weeklyCallPrompts":
                    return {
                        info: WeeklyCallPrompts.findOne(new Mongo.ObjectID(task.task_id)).Script
                    };
            }
        });
    }
})
