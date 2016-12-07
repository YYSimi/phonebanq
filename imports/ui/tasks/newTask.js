// TODO:  Do we really need these?

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import { Task, PhoneTask } from '../../api/taskClasses.js'

import './newTask.html'

Template.authenticatedUserNewTask.onCreated(function () {
    Meteor.subscribe('userTasks');
    Meteor.subscribe('tasks');
    Meteor.subscribe('phoneTasks');
});

Template.authenticatedUserNewTask.helpers({
    currentTaskType() {
        // TODO:  Make this update reactively based on the task type.
        return "phoneTaskDetail";
    }
})

Template.authenticatedUserNewTask.onRendered(function() {
    for (taskType in PBTaskTypesEnum) 
    {
        $("#task-type").append("<option> " + taskType + " </option>");
    }
})

Template.authenticatedUserNewTask.events({
    'submit form'(evt) {
        evt.preventDefault();
        var task = new Task(
            $("#tiny-description").val(),
            $("#brief-description").val(),
            new Date(), // TODO: handle start/end dates properly.
            new Date(),
            PBTaskTypesEnum.phone,
            null,
            5 //TODO:  pump priority into the form.
        );

        // TODO:  Make this work for more than just phone taks.
        var phoneTask = new PhoneTask(
            $("#general-script").val(),
            $("#supporter-script").val(),
            $("#opposition-script").val(),
            null,
            $("#call-my-national-senators").val(),
            $("#call-my-national-representatives").val(),
            null,
            null,
            null
        );

        Meteor.call('tasks.registerNewTask', task, phoneTask);
        return false;
    }
});