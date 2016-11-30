import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import './completedTasks.html'
import '../../api/tasks.js'


// TODO:  Is this the right place to do the subscription?
Template.completedTasks.onCreated(function () {
    Meteor.subscribe('userTasks');
    Meteor.subscribe('dailyCallPrompts');
    Meteor.subscribe('weeklyCallPrompts');
});

Template.completedTasks.helpers({
    getTasks() {
        var tasks = UserTasks.find({ user_id: Meteor.userId(), is_completed: true });
        console.log("Found " + tasks.count() + " tasks for uid" + Meteor.userId());
        
        return tasks.map(task => {
            switch (task.task_type) {
                case "dailyCallPrompts":
                    return {
                        userTask: task,
                        type: task.task_type,
                        task: DailyCallPrompts.findOne(new Mongo.ObjectID(task.task_id))
                    };
                case "weeklyCallPrompts":
                    return {
                        userTask: task,
                        type: task.task_type,
                        task: WeeklyCallPrompts.findOne(new Mongo.ObjectID(task.task_id))
                    };
            }
        });
    }
});

Template.UserTaskII.events({
    'click .js-task-unsuccess'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('tasks.cancelTask', this.userTask._id);
        //})
    },
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
