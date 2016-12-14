// TODO:  Do we really need these?

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { FindTaskDetailFromTask, getCongressionalInfoByZip } from '../../../lib/common.js'

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

Template.setLocation.events({
    'click .js-location-submit'() {
        var zip = $('#user-zip').val();
        console.log("zip code is " + zip);
        if (zip) {
            getCongressionalInfoByZip(zip, function(error, congresspeople) {
                if (error) {
                    console.log(error);
                }
                else {
                    Session.set("congresspeople", congresspeople);
                }
            })
        }
    }
})

Template.setLocation.onRendered(function () {
    //TODO:  Enable select2 on this dropdown.
//    $("#select-user-state").select2({placeholder: 'Select State'});
})
