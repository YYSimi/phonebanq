import { Template } from 'meteor/templating';
  
import './userSettings.html';

Template.userSettings.helpers({
    state() {
        user = Meteor.user();
        if (user && user.profile && user.profile.state){
            return user.profile.state;
        }
        return "";
    }
})

Template.userSettings.events({
    'click .js-userSettings-submit'() {
                console.log("setting state to " + $('#user-state').val())
                console.log($('#user-state'))
                Meteor.call('users.setState', $('#user-state').val(), "manual" );
        },
});