import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { PopulateLocationFromFacebook, GetCongressionalInfo } from '../../lib/common.js'

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
    'users.setLatitude'(latitude) {
        check(latitude, Number) // TODO:  Seriously, figure out when things should be strings/numbers/objects.
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update({_id: this.userId}, { $set:
            {"profile.latitude" : latitude}
        })
    },
    'users.setLongitude'(longitude) {
        check(longitude, Number) // TODO:  Seriously, figure out when things should be strings/numbers/objects.
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

        GetCongressionalInfo(Meteor.user());        //TODO:  This should definitely be structured so it happens automatically on user location update.
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
        GetCongressionalInfo(user);        //TODO:  This should definitely be structured so it happens automatically on user location update.
    }
});