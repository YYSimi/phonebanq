// TODO:  Do we really need these?

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

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
    Meteor.subscribe('adminTasks');

    this.autorun(() => {
        var taggedTaskDetailIds = Tasks.find().map( function(item) {
            retval = { task_type: item.task_type, task_detail_id: item.task_detail_id };
            return retval;
        });
        this.subscribe('taskDetails', taggedTaskDetailIds);
    } );
});

Template.authenticatedTasksAdmin.helpers({
    getOwnedTasks() {
        var tasks = Tasks.find();

        var retval = tasks.map(task => {
            var taskDetail = FindTaskDetailFromTask(task)
            var mapRetval = null;
            if (taskDetail) { 
                mapRetval = {
                    task: task,
                    taskDetail: taskDetail 
                }
            }
            return mapRetval;
        }).filter( function(item) { return item != null} );

        return retval;
    }
})

Template.manageTaskButtons.events({
    'click .js-task-disable'(evt) {
        Meteor.call('tasks.disableTask', this.task._id);
    },
    'click .js-edit-task'(evt){
        Router.go('editTask', {_id: this.task._id._str});
    }
});

Template.manageTaskButtons.onRendered(function() {
    this.$('[data-toggle="tooltip"]').tooltip();
})