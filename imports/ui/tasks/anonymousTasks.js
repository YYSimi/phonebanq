// TODO:  Do we really need these?

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { Task, PhoneTask } from '../../api/taskClasses.js'
import { FindTaskDetailFromTask } from '../../../lib/common.js'

import './anonymousTasks.html'

Template.anonymousTasksActual.onCreated(function () {
    Meteor.subscribe('topTasks');
});

Template.anonymousTasksActual.helpers({
    getTopTasks() {
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