import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { PopulateLocationFromFacebook, UpdateUserLatLong, UpdateCongressionalInfo } from '../../lib/common.js'

// TODO:  Should I have a class implementing user functionality, which Meteor.Methods calls into?

Meteor.methods({
    'users.setState'(state) { //Set the User's US state.  Record what auth provider or settings pane was used.
        check(state, String);
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        
        Meteor.users.update({ _id: this.userId}, { $set:
            {"profile.state" : state} });
    },
    'users.setCity'(city) {
        check(city, String)
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({_id: this.userId}, { $set:
            {"profile.city" : city}
        })
    },
    'users.GeocodeLatLong'(){
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        if (Meteor.isServer) {
            UpdateUserLatLong(Meteor.user())
        }
    },
    'users.setLatitude'(latitude) {
        check(latitude, Number)
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({_id: this.userId}, { $set:
            {"profile.latitude" : latitude}
        })
    },
    'users.setLongitude'(longitude) {
        check(longitude, Number)
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({_id: this.userId}, { $set:
            {"profile.longitude" : longitude}
        })
    },
    'users.setZipCode'(zipCode) {
        check(zipCode, String);
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({ _id: this.userId}, { $set:
            {"profile.zipCode" : zipCode} });

        UpdateCongressionalInfo(Meteor.user());        //TODO:  This should definitely be structured so it happens automatically on user location update.
    },
    'users.setStreet'(street) {
        check(street, String)
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({ _id: this.userId}, { $set:
            {"profile.street" : street} });
    },
    'users.setLocationDataSource'(locationDataSource) {   //TODO:  LocationDataSource needs to be an Enum!
        check(locationDataSource, String);
        if (!this.userId) {
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

        Meteor.users.update({ _id: this.userId}, { $set:
            {"profile.locationDataSource" : locationDataSource } });
        
        if (Meteor.isServer) {
            if (locationDataSource === "facebook") {
                PopulateLocationFromFacebook(user.services.facebook.accessToken);
            }
        }
        UpdateCongressionalInfo(user);        //TODO:  This should definitely be structured so it happens automatically on user location update.
    }
});