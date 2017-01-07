import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations'
import { Roles } from 'meteor/alanning:roles' 

import { ContactPreferences } from '../imports/api/userClasses.js'


// Adds default values for user settings fields.
Migrations.add({
    version: 1,
    up: function() {
        Meteor.users.find().forEach((user) => {
            var userEmailAddress = "";
            if (user.emails && user.emails[0] && user.emails[0].address) {
                userEmailAddress = user.emails[0].address;
            }
            else if (user.services && user.services.facebook && user.services.facebook.email) {
                userEmailAddress = user.services.facebook.email;
            }
            var defaultSettings = new ContactPreferences(
                true,
                1,
                "daily",
                (user.profile && user.profile.loginsource === "facebook") ? true : false, // fUseFacebokForRecurring
                false, // fUseEmailForRecurring
                true, // fMajorEventNotify
                (user.profile && user.profile.loginsource === "facebook") ? true : false, // fUseFacebookForMajor
                true, // fUseEmailForMajor
                userEmailAddress // emailAddress
            )
            Meteor.users.update(user._id, {$set: {"profile.contactPreferences": defaultSettings}});
        })
    },
    down: function () {
        Meteor.users.find().forEach((user) => {
            Meteor.users.update(user._id, {$unset: {"profile.contactPreferences": true }});
        })
    }
})

// Move global user permissions to use the user Roles package
Migrations.add({
    version: 2,
    up: function() {
        Meteor.users.find().forEach((user) => {
            const fRegisterNewTasks = user.profile && user.profile.permissions && user.profile.permissions.registerNewTasks;
            const fManageUserGroups = user.profile && user.profile.permissions && user.profile.permissions.manageUserGroups;
            if (fManageUserGroups) {
                Roles.addUsersToRoles(user, 'site-admin', Roles.GLOBAL_GROUP);
            }
            Meteor.users.update(user._id, {$unset: {"profile.permissions": true}});
        })
    },
    down: function () {
        Meteor.users.find().forEach((user) => {
            const fAdmin = Roles.userIsInRole(user, 'site-admin');
            if (fAdmin) {
                const adminPermissions = {manageUserGroups: true, registerNewTasks: true };
                Meteor.users.update(user._id, {$set: {"profile.permissions": adminPermissions} });
            }
            Roles.removeUsersFromRoles(user, 'site-admin', Roles.GLOBAL_GROUP);
        })
    }
})

var UserGroupRankEnum = {
    owner: 10,
    admin: 7,
    deputy: 4,
    member: 1,
    unknown: 0
}

// move user group permissions to use the user roles package
Migrations.add({
    version: 3,
    up: function() {
        Meteor.users.find().forEach((user) => {
            if (user.profile && user.profile.groups) {
                user.profile.groups.forEach((group) => {
                    const groupActual = UserGroups.findOne(group.group_id);
                    if (groupActual) {
                        switch(group.rank) {
                            case UserGroupRankEnum.owner:
                                Roles.addUsersToRoles(user, 'owner', group.group_id._str);
                            break;
                            case UserGroupRankEnum.admin:
                                Roles.addUsersToRoles(user, 'admin', group.group_id._str);
                            break;
                            case UserGroupRankEnum.deputy:
                                Roles.addUsersToRoles(user, 'deputy', group.group_id._str);
                            break;
                            case UserGroupRankEnum.member:
                                Roles.addUsersToRoles(user, 'member', group.group_id._str);
                            break;
                            case UserGroupRankEnum.unknown:
                            break;
                        }
                    }
                })
            }
            Meteor.users.update(user._id, {$unset: {"profile.groups": true}});
        })
    },
    down: function() {
        // Not worth implementing down functionality here, we're still in alpha. 
    }
})