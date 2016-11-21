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
        // Senators.update( $set: { state: state } );
    }
})