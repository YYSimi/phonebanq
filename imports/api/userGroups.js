import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

Meteor.methods({
    'userGoups.create'(userGroup){
        check(userGroup, {
            name: String,
            owner_id: String
        });

        var user = Meteor.user();
        if (!user || !user.profile || !user.profile.permissions || 
            !user.profile.permissions.manageUserGroups) {
            throw new Meteor.Error('not-authorized', "The logged-in user does not have permission to manage user groups.")
        }

        var owner = users.findOne(new Mongo.ObjectID(userGroup.owner_id));
        if (!owner) {
            throw new Meteor.Error('invalid-argument', "The owner identified for this group does not exist");
        }

        UserGroups.insert(userGroup);
    }
})