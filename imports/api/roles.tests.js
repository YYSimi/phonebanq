import './tasks.js'
import { Task, PhoneTask, PBTaskTypesEnum } from './taskClasses.js';

import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Roles } from 'meteor/alanning:roles';

if (Meteor.isServer) {
    describe('roles API tests', () => {
        //---- HELPERS
        //-------------------------------------------- //

        //---- TESTCASES
        //-------------------------------------------- //
        beforeEach(() => {
            var email = 'test_account@test.com';
            var password = '123456';

            resetDatabase();
            userId = Accounts.createUser({email: email, password : password});
            user = Meteor.users.findOne(userId);
            assert(user, "failed to find user");

            Meteor.userId = function() { return userId; };
            Meteor.user = function() { return Meteor.users.findOne(userId); };
        })

        it('admin users can grant roles to users', () => {
            const testRoleName = 'test-role';
            const testGroupName = 'test-group';
            const otherGroupName = 'test-group2';

            Roles.addUsersToRoles(Meteor.user(), 'site-admin', Roles.GLOBAL_GROUP);
            Meteor.call('roles.addUsersToRoles', [Meteor.userId()], [testRoleName], testGroupName);
            assert.isTrue(Roles.userIsInRole(Meteor.user(), testRoleName, testGroupName));
            assert.isFalse(Roles.userIsInRole(Meteor.user(), testRoleName, otherGroupName));
        });

        it('admin users can remove roles from users', () => {
            const testRoleName = 'test-role';
            const testGroupName = 'test-group';
            const otherGroupName = 'test-group2';

            Roles.addUsersToRoles(Meteor.user(), 'site-admin', Roles.GLOBAL_GROUP);
            Meteor.call('roles.addUsersToRoles', [Meteor.userId()], [testRoleName], testGroupName);
            Meteor.call('roles.addUsersToRoles', [Meteor.userId()], [testRoleName], otherGroupName);
            assert.isTrue(Roles.userIsInRole(Meteor.user(), testRoleName, testGroupName));
            assert.isTrue(Roles.userIsInRole(Meteor.user(), testRoleName, otherGroupName));
            Meteor.call('roles.removeUsersFromRoles', [Meteor.userId()], [testRoleName], testGroupName);
            assert.isFalse(Roles.userIsInRole(Meteor.user(), testRoleName, testGroupName));          
            assert.isTrue(Roles.userIsInRole(Meteor.user(), testRoleName, otherGroupName));
        });

        it('non-admin users cannot grant roles to users', () => {
            const testRoleName = 'test-role';
            const testGroupName = 'test-group';

            assert.throws(() => {Meteor.call('roles.addUsersToRoles', [Meteor.userId()], [testRoleName], testGroupName)}, ['access-denied']);
            assert.isFalse(Roles.userIsInRole(Meteor.user(), testRoleName, testGroupName));
        });

        it('non-admin users cannot remove roles from users', () => {
            const testRoleName = 'test-role';
            const testGroupName = 'test-group';

            Roles.addUsersToRoles(Meteor.user(), 'site-admin', Roles.GLOBAL_GROUP);
            Meteor.call('roles.addUsersToRoles', [Meteor.userId()], [testRoleName], testGroupName);
            assert.isTrue(Roles.userIsInRole(Meteor.user(), testRoleName, testGroupName));

            Roles.removeUsersFromRoles(Meteor.user(), 'site-admin', Roles.GLOBAL_GROUP);
            assert.throws(() => {Meteor.call('roles.removeUsersFromRoles', [Meteor.userId()], [testRoleName], testGroupName)}, ['access-denied']);
            assert.isTrue(Roles.userIsInRole(Meteor.user(), testRoleName, testGroupName));

        });

    });
}