import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import './completedTasks.html'
import '../../api/tasks.js'


// TODO:  Is this the right place to do the subscription?
Template.completedTasks.onCreated(function () {
    Meteor.subscribe('userTasksView');
});

Template.completedTasks.helpers({
    getUserTasks() {
        var userTasks = UserTasks.find({ user_id: Meteor.userId(), is_completed: true, is_active: false });
        return userTasks.map(userTask => {
            var retval =  {
                userTask: userTask,
                task: Tasks.findOne(new Mongo.ObjectID(userTask.task_id))
            }

            switch(retval.task.task_type) {
                case "phone":
                    retval.taskDetail = PhoneTasks.findOne(new Mongo.ObjectID(retval.task.task_detail_id));
                    break;
                default:
                    throw "Invalid task type";
            }

            return retval;
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