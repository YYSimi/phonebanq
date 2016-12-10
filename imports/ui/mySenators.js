import { Template } from 'meteor/templating';

import './mySenators.html';

// TODO:  Is this the right place to subscribe?
Template.mySenators.onCreated(function() {
    Meteor.subscribe('senators');
})

Template.mySenators.helpers({
    senators() {
        user = Meteor.user();
        retval = [];
        if (user){
            user.profile.congressInfo.senate.forEach(function (senatorId) {retval.push(Senators.findOne({bioguide_id : senatorId}))});
        }
        return retval;
        },
    nSenators() {
        return senators().count();
    }
})