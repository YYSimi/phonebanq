import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { PopulateLocationFromFacebook, UpdateUserLatLong, UpdateCongressionalInfo } from '../../lib/common.js'
import { PopulateStateUserTasks } from '/server/userTasks.js'

// TODO:  Should I have a class implementing user functionality, which Meteor.Methods calls into?

Meteor.methods({
    'users.setState'(state) { //Set the User's US state.  Record what auth provider or settings pane was used.
        check(state, String);
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        
        // TODO:  This should automatically happen whenever something that looks like a state change
        // occurs.  Need to model user locations properly so that we don't scatter these PopulateUserTasks
        // cals all over the codebase.  Also note that users can get extra tasks now by competing tasks and
        // then changing their state registration.  Need to improve our task model so we have better timestamp
        // information on when our next tasks should show up.
        if (Meteor.isServer) {
            PopulateStateUserTasks(Meteor.userId());
        }
        Meteor.users.update({ _id: Meteor.userId()}, { $set:
            {"profile.state" : state} });
    },
    'users.setCity'(city) {
        check(city, String)
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({_id: Meteor.userId()}, { $set:
            {"profile.city" : city}
        })
    },
    'users.GeocodeLatLong'(){
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        if (Meteor.isServer) {
            UpdateUserLatLong(Meteor.user())
        }
    },
    'users.setLatitude'(latitude) {
        check(latitude, Number)
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({_id: Meteor.userId()}, { $set:
            {"profile.latitude" : latitude}
        })
    },
    'users.setLongitude'(longitude) {
        check(longitude, Number)
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({_id: Meteor.userId()}, { $set:
            {"profile.longitude" : longitude}
        })
    },
    'users.setZipCode'(zipCode) {
        check(zipCode, String);
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({ _id: Meteor.userId()}, { $set:
            {"profile.zipCode" : zipCode} });

        UpdateCongressionalInfo(Meteor.user());        //TODO:  This should definitely be structured so it happens automatically on user location update.
    },
    'users.setStreet'(street) {
        check(street, String)
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({ _id: Meteor.userId()}, { $set:
            {"profile.street" : street} });
    },
    'users.setLocationDataSource'(locationDataSource) {   //TODO:  LocationDataSource needs to be an Enum!
        check(locationDataSource, String);
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        
        user = Meteor.user();

        // Make sure that the data source passed in is valid for this user.
        if ( locationDataSource === "facebook" ) {
            if (!user.services || !user.services.facebook || !user.services.facebook.accessToken) {
                console.log(this);
                throw new Meteor.Error('bad-user-state')
            }
        }

        Meteor.users.update({ _id: Meteor.userId()}, { $set:
            {"profile.locationDataSource" : locationDataSource } });
        
        if (Meteor.isServer) {
            if (locationDataSource === "facebook") {
                PopulateLocationFromFacebook(user.services.facebook.accessToken);
            }
        }
    },
    'users.deleteUser'(){
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.remove(Meteor.userId());
    },
    'users.setContactPreferences'(prefs){
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        check(prefs,
        {
            fRecurringNotify: Boolean,
            notifyPeriod: Number,
            notifyPeriodType: String, //TODO:  Be more specific.
            fUseFacebookForRecurring: Boolean,
            fUseEmailForRecurring: Boolean,
            fMajorEventNotify: Boolean,
            fUseFacebookForMajor: Boolean,
            fUseEmailForMajor: Boolean,
            emailAddress: String    // TODO:  make sure this is a valid email
        });

        if (prefs.notifyPeriod < 1) {
            prefs.notifyPeriod = 1;
        }

        Meteor.users.update(Meteor.userId(), {$set: {"profile.contactPreferences": prefs}});
    }
});