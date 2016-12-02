import { Template } from 'meteor/templating';
  
import './userSettings.html';

Template.loggedInUserSettings.helpers({
    isLocationFromFacebook() {
        return this.profile && this.profile.locationDataSource === "facebook";
    }
})

Template.loggedInUserSettings.events({
    'click .js-userSettings-submit'() {
        Meteor.call('users.setState', $('#user-state').val());
        Meteor.call('users.setZipCode', $('#user-zip').val());
    },
    'click .js-userSettings-useFacebookCheckbox'(event) {
        Meteor.call('users.setLocationDataSource', event.target.checked ? "facebook" : "manual" );
    }
});