// TODO:  Do we really need these?

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

import { Task, PhoneTask, FreeformTask, PBTaskTypesEnum } from '../../api/taskClasses.js';
import { hasEditPermissionsByRank } from '../../api/userGroupClasses.js';

import './newTask.html'

// TODO: Is this really the best way to force an update on preview click? 
var nPreviewClicks = new ReactiveVar(0);
var currentTaskType = new ReactiveVar("");

var quillInstructions;
var quillNotes;

Template.newTask.helpers({
    fHasNewTaskPermissions() {
        var user = Meteor.user();
        return user && user.profile && user.profile.permissions && user.profile.permissions.registerNewTasks;
    }
})

Template.authenticatedUserNewTask.onCreated(function () {
    var tmpl = Template.instance();
    tmpl.taskToEdit = new ReactiveVar({});
    tmpl.taskDetailToEdit = new ReactiveVar({});
    Meteor.subscribe('senators');
    Meteor.subscribe('representatives');
});

Template.authenticatedUserNewTask.helpers({
    currentTaskDetailTemplateName() {
        return currentTaskType.get() + "NewTaskDetail";
    },
    fShouldRenderTaskPreview() {
        return nPreviewClicks.get();
    },
    taskPreviewInfo() {
        if (nPreviewClicks.get() != 0) {
            var task = {};
            var taskDetail = {};
            var taskType = currentTaskType.get();

            // TODO:  Make quills behave properly for previews.

            task = new Task(
                    $("#tiny-description").val(),
                    $("#brief-description").val(),
                    new Date(), // TODO: handle start/end dates properly.
                    new Date(),
                    taskType,
                    [],
                    parseInt($("#task-priority").val()),
                    1,   // TODO:  Pipe XP Values in.
                    $("#task-group").val()
                )

            switch(taskType) {
                case (PBTaskTypesEnum.phone):
                    taskDetail = new PhoneTask(
                        $("#general-script").val(),
                        $("#supporter-script").val(),
                        $("#opposition-script").val(),
                        $("#task-notes").val(),
                        $("#call-my-national-senators").val()  === "true",
                        $("#call-my-national-representatives").val()  === "true",
                        $("#call-custom-senators").val(),
                        $("#call-custom-representatives").val(),
                        []
                    );
                    break;
                case (PBTaskTypesEnum.freeform):
                    taskDetail = new FreeformTask(
                        $("#task-instructions").val(),
                        $("#task-notes").val()
                    );
                    break;
                default:
                    throw "invalid task type"
            }

            retval = {
                task: task,
                taskDetail: taskDetail
            };
            
            return retval;
        }
    },
    getTaskDetailToEdit(){
        return Template.instance().taskDetailToEdit;
    }

})

Template.authenticatedUserNewTask.onRendered(function() {
    var tmpl = Template.instance();
    for (taskType in PBTaskTypesEnum) 
    {
        $("#task-type").append("<option> " + taskType + " </option>");
    }

    user = Meteor.user();
    Meteor.subscribe('userGroups', function() {
        // TODO:  Sort alphabetically.
        user.profile.groups.forEach(function (groupInfo){
            if (hasEditPermissionsByRank(groupInfo.rank)) {
                var group = UserGroups.findOne(groupInfo.group_id);
                if (group) {
                    $("#task-group").append("<option value=" + group._id + ">" + group.name + "</option>" ); 
                }
            } 
        })
    });

    // TODO: This is disgusting, and should not run in response to onRendered.
    // Move most of this logic to the HTML file.
    if (tmpl.data) {
        var taskMongoId = new Mongo.ObjectID(tmpl.data);

        tmpl.subscribe('tasksAndDetails', [taskMongoId],
            function() { 
                var task = Tasks.findOne(taskMongoId);
                if (task) {
                    tmpl.taskToEdit.set(task);

                    var taskDetail = {};
                    switch(task.task_type) {
                        case PBTaskTypesEnum.phone:
                            taskDetail = PhoneTasks.findOne(new Mongo.ObjectID(task.task_detail_id));
                            break;
                        case PBTaskTypesEnum.freeform:
                            taskDetail = FreeformTasks.findOne(new Mongo.ObjectID(task.task_detail_id));
                            break;
                        default:
                            throw "Unknown task type";
                    }
                    tmpl.taskDetailToEdit.set(taskDetail);
                }

                $("#tiny-description").val(task.tiny_description),
                $("#brief-description").val(task.brief_description),
                $("#task-priority").val(task.priority);
                $("#task-group").val(task.group);
                $("#task-type").val(task.task_type);
                currentTaskType.set(task.task_type);
                $("#task-type").prop("disabled", "disabled");
            }
        );
    }

    Template.instance().$("#new-task").validate();

})

Template.authenticatedUserNewTask.events({
    'submit form'(evt, tmpl) {
        evt.preventDefault();
        var taskType = currentTaskType.get();

        // TODO:  This is super janky!  Structure this better!
        if ($("#task-instructions")[0]) {
            $("#task-instructions").val(JSON.stringify(quillInstructions.getContents()))
        }
        if ($("#task-notes")[0]) {
            $("#task-notes").val(JSON.stringify(quillNotes.getContents()))
        }

        var task = new Task(
            $("#tiny-description").val(),
            $("#brief-description").val(),
            new Date(), // TODO: handle start/end dates properly.
            new Date(),
            taskType,
            [],
            parseInt($("#task-priority").val()),
            1,   // TODO:  Pipe XP Values in.
            $("#task-group").val()
        );

        var taskDetail = {};

        switch(taskType) {
            case (PBTaskTypesEnum.phone):
                taskDetail = new PhoneTask(
                    $("#general-script").val(),
                    $("#supporter-script").val(),
                    $("#opposition-script").val(),
                    $("#task-notes").val(),
                    $("#call-my-national-senators").val()  === "true",
                    $("#call-my-national-representatives").val()  === "true",
                    $("#call-custom-senators").val(),
                    $("#call-custom-representatives").val(),
                    []
                );
                break;
            case (PBTaskTypesEnum.freeform):
                taskDetail = new FreeformTask(
                    $("#task-instructions").val(),
                    $("#task-notes").val()
                );
                break;
            default:
                throw "invalid task type"
        }

        if (tmpl.data) {
            Meteor.call('tasks.editTask', new Mongo.ObjectID(tmpl.data), task, taskDetail);
        } else {
            Meteor.call('tasks.registerNewTask', task, taskDetail);
        }
        return false;
    },

    'click .js-newTask-preview'() {
        nPreviewClicks.set(nPreviewClicks.get()+1);
    },

    'change #task-type'() {
        currentTaskType.set($("#task-type").val());
    }
});

Template.phoneNewTaskDetail.onCreated(function() {
    Template.instance().fSenatorsReady = new ReactiveVar(false);
    Template.instance().fRepresentativesReady = new ReactiveVar(false);
})

Template.phoneNewTaskDetail.onRendered(function() {
    $("#call-custom-senators").select2({placeholder: 'e.g John McCain'});
    $("#call-custom-representatives").select2({placeholder: 'e.g Jerrold Nadler'});

    var tmpl = Template.instance();
    Meteor.subscribe(
        'senators',
        function()  {
            Senators.find({}, {sort: {first_name:1} }).fetch().forEach( (senator) => {
                $("#call-custom-senators").append("<option value=" + senator.bioguide_id + ">" + senator.first_name + " " + senator.last_name + " </option>");
            })

            tmpl.fSenatorsReady.set(true);
        }
    );
    Meteor.subscribe(
        'representatives',
        function() {
            Representatives.find({}, {sort: {first_name:1} }).fetch().forEach( (rep) => {
                $("#call-custom-representatives").append("<option value=" + rep.bioguide_id + ">" + rep.first_name + " " + rep.last_name + " </option>");
            });

            tmpl.fRepresentativesReady.set(true);
        }
    );

    quillNotes = new Quill('#task-notes', {
        theme: 'snow'
    });
    // Fill out data on the representatives, once the collection is ready.
    Tracker.autorun(function () {
        if (tmpl && tmpl.data) {
            var phoneTask = tmpl.data.get();
            if (!_.isEmpty(phoneTask) && tmpl.fRepresentativesReady.get()) {
                tmpl.$("#call-custom-representatives").val(phoneTask.call_custom_representatives).change();
            }
        }
    });

    // Fill out data on the senators, once the collection is ready.
    Tracker.autorun(function () {
        if (tmpl && tmpl.data) {
            var phoneTask = tmpl.data.get();
            if (!_.isEmpty(phoneTask) && tmpl.fSenatorsReady.get()) {
                tmpl.$("#call-custom-senators").val(phoneTask.call_custom_senators).change();
            }
        }
    });

    // Fill out data on most of the template.
    Tracker.autorun(function() {
        // Pre-filled data means we're editing an existing task.
        if (tmpl && tmpl.data) {
            var phoneTask = tmpl.data.get();
            if (!_.isEmpty(phoneTask)) {
                tmpl.$("#general-script").val(phoneTask.general_script);
                tmpl.$("#supporter-script").val(phoneTask.supporter_script);
                tmpl.$("#opposition-script").val(phoneTask.opposition_script);

                if (phoneTask.notes) {
                quillNotes.setContents(JSON.parse(phoneTask.notes));

                tmpl.$("#call-my-national-senators").val(phoneTask.call_my_national_senators ? "true" : "false");
                tmpl.$("#call-my-national-representatives").val(phoneTask.call_my_national_representatives ? "true" : "false");
            }
        }
    })

})

Template.freeformNewTaskDetail.onRendered(function() {
    var tmpl = Template.instance();
    quillNotes = new Quill('#task-notes', {
        theme: 'snow'
    })

    quillInstructions = new Quill('#task-instructions', {
        theme: 'snow'
    });

    Tracker.autorun(function() {
        if (tmpl && tmpl.data) {
            var freeformTask = tmpl.data.get();
            
            if (freeformTask.notes) {
                quillNotes.setContents(JSON.parse(freeformTask.notes));
            }
            if (freeformTask.instructions) {
                quillInstructions.setContents(JSON.parse(freeformTask.instructions)); 
            }
        }
    });
})