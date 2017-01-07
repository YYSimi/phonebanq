import { Match, check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

Meteor.methods({
    // TODO:  Data validation!
    // TODO:  _Definitely_ make task DB management a different API/class than userTask management.
    'roles.addUsersToRoles'(users, roles, group){
        check(users, [String]);
        check(roles, [String]);
        check(group, String);

        console.log(users);
        console.log(roles);
        console.log(group);

        if (!Roles.userIsInRole(Meteor.userId(), 'site-admin')) {
            throw new Meteor.Error("access-denied");
        }

        Roles.addUsersToRoles(users, roles, group);
    },
    'roles.removeUsersFromRoles'(users, roles, group){
        check(users, [String]);
        check(roles, [String]);
        check(group, String);

        if (!Roles.userIsInRole(Meteor.userId(), 'site-admin')) {
            throw new Meteor.Error("access-denied");
        }

        if (group) {
            Roles.removeUsersFromRoles(users, roles, group);
        } else {
            Roles.removeUsersFromRoles(users, roles);
        }
    }
});