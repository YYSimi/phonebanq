import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

Meteor.methods({
    'users.setState'(state) { //Set the User's US state
        check(state, String);
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        
        Meteor.users.update({ _id: this.userId}, { $set: {"profile.state" : state} });
    },
    'users.updateTaskCount'() { // Caches how many tasks the user currently has active.                              // TODO:  This logic is currently being done on both client and server.  Make it happen on only one of them.
        Meteor.users.update(
            { _id: Meteor.userId() },
            { $set: { "statistics.activeTasks" : UserTasks.find({ user_id: Meteor.userId()}).count() } }
            );
    },
    'users.getTaskCount'() {
        return Meteor.users.findOne(Meteor.userId()).statistics.activeTasks;
    }
})