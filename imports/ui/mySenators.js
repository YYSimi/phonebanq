import { Template } from 'meteor/templating';
  
import './mySenators.html';

Template.mySenators.helpers({
    senators() {
        if (Meteor.user()){
            return Senators.find({state: Meteor.user().profile.state});
        }
        return [];
        },
    nSenators() {
        if (Meteor.user()) {
            return Senators.find({state: Meteor.user().profile.state}).count();
        }
        return 0;
    }
})