import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

import { UserGroupRankEnum } from './userGroupClasses.js'

var length_minimum = 3;

Meteor.methods({
    'userGroups.create'(userGroup){
        check(userGroup, {
            name: String,
            owner_id: String,
            admin_ids: [String],
            deputy_ids: [String]
        });

        if (!userGroup.name || !userGroup.name.length || userGroup.name.length < length_minimum ) {
            throw new Meteor.Error('invalid-argument', "The group name specified is missing or too short.");
        }

        // TODO:  This should not throw an error.  Report back to the user that they 
        // need to use a different name.
        if (UserGroups.findOne({name: userGroup.name})) {
            throw new Meteor.Error('Group name already exists');
        }


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
        });

        userGroup.deputy_ids = userGroup.deputy_ids.filter(function(id) {
            var deputy = Meteor.users.findOne(id);
            if (!deputy) {
                return false;
            }
            return true;
        });

        var groupId = UserGroups.insert(userGroup);
        var ownerGroupMembership = {group_id: groupId, rank: UserGroupRankEnum.owner };
        var adminGroupMembership = {group_id: groupId, rank: UserGroupRankEnum.admin };
        var deputyGroupMembership = {group_id: groupId, rank: UserGroupRankEnum.deputy };

        Meteor.users.update(userGroup.owner_id, {$push: {'profile.groups' : ownerGroupMembership } });

        userGroup.admin_ids.forEach(function(id) {
            Meteor.users.update(id, {$push: {'profile.groups' : adminGroupMembership } });
        });

        userGroup.deputy_ids.forEach(function(id) {
            Meteor.users.update(id, {$push: {'profile.groups' : deputyGroupMembership } });
        });

    },
    'userGroups.update'(userGroupId, newUserGroupSettings){
        check(userGroupId, String);
        check(newUserGroupSettings, {
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


        var oldGroup = UserGroups.findOne(new Mongo.ObjectID(userGroupId));
        if (!oldGroup) {
            throw new Meteor.Error('invalid-argument', "The given usergroupId does not exist.");
        }
        
        var length_minimum = 3
        if (!newUserGroupSettings.name || !newUserGroupSettings.name.length || newUserGroupSettings.name.length < length_minimum ) {
            throw new Meteor.Error('invalid-argument', "The group name specified is missing or too short.");
        }

        // If we've changed names, make sure no other group has the same name.
        // TODO:  This should not throw an error.  Report back to the user that they 
        // need to use a different name.
        if (newUserGroupSettings.name !== oldGroup.name) {
            if (UserGroups.findOne({name: newUserGroupSettings.name})) {
                throw new Meteor.Error('Group name already exists');
            }
        }

        // Make sure that the owner is a real user.
        // TODO:  This should not throw an error.
        var owner = Meteor.users.findOne(newUserGroupSettings.owner_id);
        if (!owner) {
            throw new Meteor.Error('invalid-argument', "The owner identified for this group does not exist");
        }

        // Make sure no invalid users are in the admin array
        newUserGroupSettings.admin_ids = newUserGroupSettings.admin_ids.filter(function(id) {
            var admin = Meteor.users.findOne(id);
            if (!admin) {
                return false;
            }
            return true;
        });

        // Make sure no invalid users are in the deputy array
        newUserGroupSettings.deputy_ids = newUserGroupSettings.deputy_ids.filter(function(id) {
            var deputy = Meteor.users.findOne(id);
            if (!deputy) {
                return false;
            }
            deputy.update
            return true;
        });
        
        UserGroups.update(new Mongo.ObjectID(userGroupId), newUserGroupSettings);

        var ownerGroupMembership = {group_id: new Mongo.ObjectID(userGroupId), rank: UserGroupRankEnum.owner };
        var adminGroupMembership = {group_id: new Mongo.ObjectID(userGroupId), rank: UserGroupRankEnum.admin };
        var deputyGroupMembership = {group_id: new Mongo.ObjectID(userGroupId), rank: UserGroupRankEnum.deputy };

        // Update user ownership info
        Meteor.users.update(oldGroup.owner_id, {$pull: {'profile.groups' : ownerGroupMembership } });
        Meteor.users.update(newUserGroupSettings.owner_id, {$push: {'profile.groups' : ownerGroupMembership } });

        // Update user admin info
        oldGroup.admin_ids.forEach(function(id) {
            Meteor.users.update(id, {$pull: {'profile.groups' : adminGroupMembership } });
        });

        newUserGroupSettings.admin_ids.forEach(function(id) {
            Meteor.users.update(id, {$push: {'profile.groups' : adminGroupMembership } });
        });

        // Update user deputy info
        oldGroup.deputy_ids.forEach(function(id) {
            Meteor.users.update(id, {$pull: {'profile.groups' : deputyGroupMembership } });
        });

        newUserGroupSettings.deputy_ids.forEach(function(id) {
            Meteor.users.update(id, {$push: {'profile.groups' : deputyGroupMembership } });
        });

    }
})