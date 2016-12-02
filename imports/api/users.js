import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { PopulateLocationFromFacebook } from '../../lib/common.js'

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
        
        if (Meteor.isServer && locationDataSource === "facebook") {
            PopulateLocationFromFacebook(user.services.facebook.accessToken);
        }
    },
    'users.updateTaskCount'() { // Caches how many tasks the user currently has active.                              
        // TODO:  This logic is currently being done on both client and server.  Make it happen on only one of them.
        UpdateTaskCount(Meteor.userId());
    },
    'users.getTaskCount'() {
        return GetTaskCount(userId);
    }
});