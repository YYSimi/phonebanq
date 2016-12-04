import { Template } from 'meteor/templating';

import './myRepresentatives.html';

// TODO:  Is this the right place for this subscription?
Template.myRepresentatives.onCreated(function() {
    Meteor.subscribe('representatives');
})


Template.myRepresentatives.helpers({
    representatives() {
        user = Meteor.user();
        retval = [];
        if (user){
            user.profile.congressInfo.house.forEach(function (repId) {console.log("finding " + repId); retval.push(Representatives.findOne({bioguide_id : repId}))});
        }
        return retval;
        }
    }
)