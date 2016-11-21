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
    },
    
    'users.registerPermission'(permissionName) {  // Register a valid user permission with the server
        check(permissionName, String);
        if (!checkPermissions(this.userId, 'admin')) {
            throw new Meteor.Error('not-authorized');
        }
        
        //TODO:  Register this as a legitimate permission in the DB
        
    },
    
    'users.setPermissions'(uid, permissionName, state) { // Give another user various permissions
        check(permissions, String);
        check(uid, Number);
        check(state, Boolean);
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        
        //TODO:  Validate that this is a legitimate permission
        
        //TODO:  Set the permission on the user in the DB
    },
    
    'users.checkPermissions'(uid, permissionName) {
        check(permissionName, String);
        check(uid, Number);
        
        //TODO:  Implement permissions check in DB
    },
})