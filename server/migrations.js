import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations'
import { Roles } from 'meteor/alanning:roles' 

import { ContactPreferences } from '../imports/api/userClasses.js'
import { PBTaskTypesEnum } from '../imports/api/taskClasses.js'


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

// Makes all IDs coming in, resting in, and coming out of our database be MongoIDs, and not Strings.
Migrations.add({
    version: 4,
    up: function() {
        Tasks.find().forEach((task) => {

            // Updates Tasks collection
            Tasks.update(task._id, {$set: {group_id: new Mongo.ObjectID(task.group) }});
            Tasks.update(task._id, {$unset: {group: true }});

            Tasks.update(task._id, {$set: {task_detail_id: new Mongo.ObjectID(task.task_detail_id)}});

            // Updates Task Detail collections
            switch(task.task_type) {
                case PBTaskTypesEnum.phone:
                    PhoneTasks.find({parent_task_id: task._id._str}).forEach((phoneTask) => {
                        PhoneTasks.update(phoneTask._id, {$set: {parent_task_id: task._id}});
                    })
                    break;
                case PBTaskTypesEnum.freeform:
                    FreeformTasks.find({parent_task_id: task._id._str}).forEach((phoneTask) => {
                        FreeformTasks.update(phoneTask._id, {$set: {parent_task_id: task._id}});
                    })
                break;
            }
        });

        // Updates UserTasks collection
        UserTasks.find().forEach((userTask) => {
            UserTasks.update(userTask._id, {$set: {task_id: new Mongo.ObjectID(userTask.task_id)}})
        });

    },
    down: function () {
        // Not worth implementing functionality, we're still in beta.
    }
})