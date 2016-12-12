import { Template } from 'meteor/templating';
  
import './userSettings.html';

Template.loggedInUserSettings.helpers({
    isLocationFromFacebook() {
        return this.profile && this.profile.locationDataSource === "facebook";
    },
    isUserLoggedInToFacebook() {
        return this.profile && this.profile.loginSource === "facebook";
    }
})

Template.loggedInUserSettings.events({
    'click .js-userSettings-submit'() {
        state = $('#select-user-state').val();
        zip = $('#user-zip').val()
        if (state && state !== 'na') {
            Meteor.call('users.setState', state);
        }
        if (zip) {
            zip = zip.substring(0,5)
            Meteor.call('users.setZipCode', zip);
        }
    },
    'click .js-userSettings-useFacebookCheckbox'(event) {
        Meteor.call('users.setLocationDataSource', event.target.checked ? "facebook" : "manual" );
        $("#select-user-state").val(Meteor.user().profile.state); //TODO:  This doesn't seem to be reactive!
    }
});

Template.loggedInUserSettings.onRendered(function () {
    var user = Meteor.user();
    if (user.profile && user.profile.state) {
        $("#select-user-state").val(user.profile.state);
    }
    $("#select-user-state").select2({placeholder: 'Select State'});
})