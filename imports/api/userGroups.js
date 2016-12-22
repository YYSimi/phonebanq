import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

Meteor.methods({
    'userGoups.create'(userGroup){
        check(userGroup, {
            name: String,
            owner_id: String,
            admin_ids: [String],
            deputy_ids: [String]
        });

        var user = Meteor.user();
        if (!user || !user.profile || !user.profile.permissions || 
            !user.profile.permissions.manageUserGroups) {
            throw new Meteor.Error('not-authorized', "The logged-in user does not have permission to manage user groups.")
        }

        var owner = Meteor.users.findOne(userGroup.owner_id);
        if (!owner) {
            throw new Meteor.Error('invalid-argument', "The owner identified for this group does not exist");
        }

        userGroup.admin_ids = userGroup.admin_ids.filter(function(id) {
            var admin = Meteor.users.findOne(id);
            if (!admin) {
                return false;
            }
            return true;
        })

        userGroup.deputy_ids = userGroup.deputy_ids.filter(function(id) {
            var deputy = Meteor.users.findOne(id);
            if (!deputy) {
                return false;
            }
            return true;
        })

        UserGroups.insert(userGroup);
    },
    'userGoups.edit'(userGroupId, newUserGroup){
        check(userGroupId, String);
        check(newUserGroup, {
            name: String,
            owner_id: String,
            admin_ids: [String],
            deputy_ids: [String]
        });

        var user = Meteor.user();
        if (!user || !user.profile || !user.profile.permissions || 
            !user.profile.permissions.manageUserGroups) {
            throw new Meteor.Error('not-authorized', "The logged-in user does not have permission to manage user groups.")
        }

        var group = UserGroups.find(new Mongo.ObjectID(userGroupId));
        if (!group) {
            throw new Meteor.Error('invalid-argument', "The given usergroupId does not exist.");
        }

        var owner = Meteor.users.findOne(userGroup.owner_id);
        if (!owner) {
            throw new Meteor.Error('invalid-argument', "The owner identified for this group does not exist");
        }

        userGroup.admin_ids = userGroup.admin_ids.filter(function(id) {
            var admin = Meteor.users.findOne(id);
            if (!admin) {
                return false;
            }
            return true;
        });

        userGroup.deputy_ids = userGroup.deputy_ids.filter(function(id) {
            var deputy = Meteor.users.findOne(id);
            if (!deputy) {
                return false;
            }
            return true;
        });

        UserGroups.update(group._id, newUserGroup);
    }
})