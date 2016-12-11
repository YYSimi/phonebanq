import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { FindTaskDetailFromTask, TimeDeltaToPrettyString } from '../../../lib/common.js'

import './myTasks.html'
import '../../api/tasks.js'

// TODO:  Is this the right place to do the subscription?
Template.myTasks.onCreated(function () {
    Meteor.subscribe('userTasksView');
});

Template.myTasks.helpers({
    getUserTasks() {
        var userTasks = UserTasks.find({ user_id: Meteor.userId(), is_completed: false, is_active: true });

        return userTasks.map(userTask => {
            var task = Tasks.findOne(new Mongo.ObjectID(userTask.task_id)) // TODO:  Handle error cases, function this out.
            var retval =  {
                userTask: userTask,
                task: task,
                taskDetail: FindTaskDetailFromTask(task)
            }

            // switch(retval.task.task_type) {
            //     case "phone":
            //         retval.taskDetail = PhoneTasks.findOne(new Mongo.ObjectID(retval.task.task_detail_id));
            //         break;
            //     default:
            //         throw "Invalid task type";
            // }

            return retval;
        });
    }
});

Template.UserTask.helpers({
    timeRemaining() {
        return TimeDeltaToPrettyString(new Date(), this.userTask.lasts_until);
    }
})

Template.UserTask.events({
    'click .js-task-success'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('tasks.completeTask', this.userTask._id);
        //})
    },
    'click .js-task-hide'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('tasks.cancelTask', this.userTask._id);
        //})
    },
    'click .js-task-hideForever'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('tasks.hideTaskForever', this.userTask._id);
        //})
    },
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
