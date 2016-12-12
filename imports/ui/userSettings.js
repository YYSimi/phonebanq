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
    },
    'click .js-userSettings-useFacebookCheckbox'(event) {
        Meteor.call('users.setLocationDataSource', event.target.checked ? "facebook" : "manual" );
    }
});

Template.loggedInUserSettings.onRendered(function () {
    Tracker.autorun( function() {
        var user = Meteor.user();
        if (user.profile) {
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
    
    $("#select-user-state").select2({placeholder: 'Select State'});
})