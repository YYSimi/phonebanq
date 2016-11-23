import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

Meteor.methods({
    'users.setState'(state) { //Set the User's US state
        check(state, String);
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        
        console.log(this.userId);
        console.log(Meteor.users.findOne(this.userId).profile);
        Meteor.users.update({ _id: this.userId}, { $set: {"profile.state" : state} });
        console.log(Meteor.users.findOne(this.userId).profile);
    },
    'users.updateTaskCount'(userId) { // Caches how many tasks the user currently has active.
        check(userId, String); // TODO:  Should this be an int?
                              // TODO:  This logic is currently being done on both client and server.  Make it happen on only one of them.
        Meteor.users.update(
            { _id: userId },
            { $set: { "statistics.activeTasks" : UserTasks.find({ user_id: userId}).count() } }
            );
    },
    'users.getTaskCount'() {
        return Meteor.users.findOne(this.userId).statistics.activeTasks;
    }
})