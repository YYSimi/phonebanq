import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

Meteor.methods({
    'users.setState'(state, dataSource) { //Set the User's US state.  Record what auth provider or settings pane was used.
        check(state, String);
        check(dataSource, String);
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        
        Meteor.users.update({ _id: this.userId}, { $set:
            {"profile.state" : state,
            "profile.stateDataSource" : dataSource } });

    },
    'users.updateTaskCount'() { // Caches how many tasks the user currently has active.                              
        // TODO:  This logic is currently being done on both client and server.  Make it happen on only one of them.
        UpdateTaskCount(Meteor.userId());
    },
    'users.getTaskCount'() {
        return GetTaskCount(userId);
    }
});