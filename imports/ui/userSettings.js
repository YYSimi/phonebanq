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
    'submit #location'(evt) {
        evt.preventDefault();
        city = $('#user-city').val();
        state = $('#select-user-state').val();
        zip = $('#user-zip').val()
        if (state && state !== 'na') {
            Meteor.call('users.setState', state);
        }
        if (zip) {
            zip = zip.substring(0,5)
            Meteor.call('users.setZipCode', zip);
        }
        if (city) {
            Meteor.call('users.setCity', city);
        }
        Meteor.call('users.GeocodeLatLong');
        return false;
    },
    'click .js-userSettings-useFacebookCheckbox'(event) {
        Meteor.call('users.setLocationDataSource', event.target.checked ? "facebook" : "manual" );
    }
});

Template.loggedInUserSettings.onRendered(function () {
    Tracker.autorun( function() {
        var user = Meteor.user();
        if (user && user.profile) {
            if (user.profile.state) {
                $("#select-user-state").val(user.profile.state).trigger("change");
            }
            if (user.profile.city) {
                $("#user-city").val(user.profile.city);
            }
            if (user.profile.zipCode) {
                $("#user-zip").val(user.profile.zipCode);
            }
        }
    });
})