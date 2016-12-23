import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

import { UserGroupRankEnum } from './userGroupClasses.js'

Meteor.methods({
    'userGroups.create'(userGroup){
        check(userGroup, {
            name: String,
            owner_id: String,
            admin_ids: [String],
            deputy_ids: [String]
        });

        var length_minimum = 3
        if (!userGroup.name || !userGroup.name.length || userGroup.name.length < length_minimum ) {
            throw new Meteor.Error('invalid-argument', "The group name specified is missing or too short.");
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
    'userGroups.edit'(userGroupId, newUserGroup){
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
            deputy.update
            return true;
        });

        UserGroups.update(group._id, newUserGroup);
    }
})