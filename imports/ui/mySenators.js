import { Template } from 'meteor/templating';

import './mySenators.html';

// TODO:  Is this the right place to subscribe?
Template.mySenators.onCreated(function() {
    Meteor.subscribe('nationalSenators');
})

Template.mySenators.helpers({
    senators() {
        if (Meteor.user()){
            return Senators.find({state: Meteor.user().profile.state});
        }
        return [];
        },
    nSenators() {
        return senators().count();
    }
})