// TODO:  Do we really need these?

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import { Task, PhoneTask } from '../../api/taskClasses.js'
import { FindTaskDetailFromTask } from '../../../lib/common.js'

import './tasksAdmin.html'

Template.tasksAdmin.helpers({
    fHasNewTaskPermissions() {
        var user = Meteor.user();
        return user && user.profile && user.profile.permissions && user.profile.permissions.registerNewTasks;
    }
});

Template.authenticatedTasksAdmin.onCreated(function () {
    Meteor.subscribe('tasks');
    Meteor.subscribe('phoneTasks');
});

Template.authenticatedTasksAdmin.helpers({
    getOwnedTasks() {
        var tasks = Tasks.find({ owner: Meteor.userId()});

        var retval = tasks.map(task => {
            return {
                task: task,
                taskDetail: FindTaskDetailFromTask(task)
            }
        })

        console.log(retval);
        return retval;
    }
})

Template.authenticatedTasksAdmin.events({
    'click .js-task-disable'(evt) {
        console.log(this);
        console.log("disabling" + this.task._id)
        Meteor.call('tasks.disableTask', this.task._id);
        return false;
    }
});