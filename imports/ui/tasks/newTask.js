// TODO:  Do we really need these?

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import { Task, PhoneTask } from '../../api/taskClasses.js'

import './newTask.html'

// TODO: Is this really the best way to force an update on preview click? 
var nPreviewClicks = new ReactiveVar(0);
var currentTaskType = new ReactiveVar("");

Template.newTask.helpers({
    fHasNewTaskPermissions() {
        var user = Meteor.user();
        return user && user.profile && user.profile.permissions && user.profile.permissions.registerNewTasks;
    }
})

Template.authenticatedUserNewTask.onCreated(function () {
    Meteor.subscribe('senators');
    Meteor.subscribe('representatives');
});

Template.authenticatedUserNewTask.helpers({
    currentTaskDetailTemplateName() {
        return currentTaskType.get() + "NewTaskDetail";
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
            [],
            parseInt($("#task-priority").val()),
            1   // TODO:  Pipe XP Values in.
        );

        // TODO:  Make this work for more than just phone taks.
        var phoneTask = new PhoneTask(
            $("#general-script").val(),
            $("#supporter-script").val(),
            $("#opposition-script").val(),
            "",
            $("#call-my-national-senators").val()  === "true",
            $("#call-my-national-representatives").val()  === "true",
            $("#call-custom-senators").val() || [],
            $("#call-custom-representatives").val() || [],
            []
        );

        console.log(task);

        Meteor.call('tasks.registerNewTask', task, phoneTask);
        return false;
    },

    'click .js-newTask-preview'() {
        nPreviewClicks.set(nPreviewClicks.get()+1);
    },

    'change #task-type'() {
        currentTaskType.set($("#task-type").val());
    }
});

Template.phoneNewTaskDetail.helpers({
    fShouldRenderTaskPreview() {
        return nPreviewClicks.get();
    },
    taskPreviewInfo() {
        if (nPreviewClicks.get() != 0) {
            return {
                task: new Task(
                    $("#tiny-description").val(),
                    $("#brief-description").val(),
                    new Date(), // TODO: handle start/end dates properly.
                    new Date(),
                    PBTaskTypesEnum.phone,
                    [],
                    parseInt($("#task-priority").val()),
                    1   // TODO:  Pipe XP Values in.
                ),
                taskDetail: 
                    // TODO:  Make this work for more than just phone taks.
                    new PhoneTask(
                        $("#general-script").val(),
                        $("#supporter-script").val(),
                        $("#opposition-script").val(),
                        "",
                        $("#call-my-national-senators").val() === "true", //val _always_ returns strings or arrays, apparently?
                        $("#call-my-national-representatives").val() === "true",
                        $("#call-custom-senators").val() || [],
                        $("#call-custom-representatives").val() || [],
                        [])
            }
        }
    }
})

Template.phoneNewTaskDetail.onRendered(function() {
    $("#call-custom-senators").select2({placeholder: 'e.g John McCain'});
    $("#call-custom-representatives").select2({placeholder: 'e.g Jerrold Nadler'});
    Senators.find({}, {sort: {first_name:1} }).fetch().forEach( (senator) => {
        $("#call-custom-senators").append("<option value=" + senator.bioguide_id + ">" + senator.first_name + " " + senator.last_name + " </option>");
    })
    Representatives.find({}, {sort: {first_name:1} }).fetch().forEach( (rep) => {
        $("#call-custom-representatives").append("<option value=" + rep.bioguide_id + ">" + rep.first_name + " " + rep.last_name + " </option>");
    })
})