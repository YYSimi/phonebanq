// TODO:  Do we really need these?

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';

import { FindTaskDetailFromTask } from '../../../lib/common.js'

import './anonymousTasks.html'

Template.anonymousTasksActual.onCreated(function () {
    Meteor.subscribe('topTasks');
});

Template.anonymousTasksActual.helpers({
    fShouldShowTasks() {
        return !!Session.get("congresspeople");
    },
    getTopTasks() {
        var tasks = Tasks.find({}, {sort: {priority: -1}});

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

Template.setLocation.onCreated(function () {
    Template.instance().statusText = new ReactiveVar("");
})

Template.setLocation.helpers({
    renderStatusText () {
        console.log(Template.instance().statusText);
        if (Template.instance().statusText) {
            return Template.instance().statusText.get();
        }
    },
    fShouldRenderStatusText() {
        return !!Template.instance().statusText.get();
    }
})


Template.setLocation.events({
    'click .js-location-submit'(evt, template) {

        var lookupByZipCode = (zip) => {
            if (zip) {
                Meteor.call('util.getCongressionalInfoByZip',
                    zip,
                    function(err, result) {
                        if (err) {
                            console.log(err);
                            return false;
                        }
                        else {
                            template.statusText.set(zip + ", got it!");
                            Session.set("congresspeople", result);
                        }
                    }
                );
            }
        }

        template.statusText.set("Working on it...");
        var zip = $('#user-zip').val();
        var city = $('#user-city').val();
        var state = $('#user-state').val();
        var street = $('#user-street').val();
        if (street && city && state) {
            // TODO:  Implement street-level geolocation
        }
        else if (city && state) {
            Meteor.call('util.getCongressionalInfoByCity',
                city,
                state,
                function(err, result) {
                    if (err) {
                        console.log(err);
                        if (!lookupByZipCode(zip)) {
                            template.statusText.set("Ack, something went wrong!  Double check that you've properly spelled your city's name");
                        }
                    }
                    else {
                        template.statusText.set(city + ", " + state + ", got it!");
                        Session.set("congresspeople", result);
                    }
                }
            );
        }
        else if (zip) {
            lookupByZipCode(zip);
        }
    }
})