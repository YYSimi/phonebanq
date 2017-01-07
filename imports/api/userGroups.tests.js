import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'meteor/practicalmeteor:chai';
import { Roles } from 'meteor/alanning:roles'

import { ContactPreferences } from './userClasses.js';
import { UserGroup } from './userGroupClasses.js'

import './userGroups.js'

if (Meteor.isServer) {
    describe('user group methods', function() {
        const email = 'test_account@test.com';
        const password = '123456';
        var userId;
        var user;

        beforeEach(() => {
            resetDatabase()
            userId = Accounts.createUser({email: email, password : password});
            user = Meteor.users.findOne(userId)
            Roles.addUsersToRoles(user, 'site-admin', Roles.GLOBAL_GROUP);
            assert(user, "failed to find user");
            Meteor.userId = function() { return userId };
            Meteor.user = function() { return user };
        })

        it('createGroup test', function() {
            const email2 = 'test_account2@test.com'
            const email3 = 'test_account3@test.com'
            const password = '123456'
            const userId2 = Accounts.createUser({email: email2, password : password});
            const userId3 = Accounts.createUser({email: email3, password : password});
            
            const group1 = new UserGroup("test1", userId, [userId2, userId3], []);
            const group2 = new UserGroup("test2", userId, [], [userId2, userId3]);

            Meteor.call('userGroups.create', group1);
            Meteor.call('userGroups.create', group2);
            
            const group1MongoId = UserGroups.findOne({name: group1.name})._id;
            const group2MongoId = UserGroups.findOne({name: group2.name})._id;

            console.log(UserGroups.findOne({name: group1.name}));
            console.log(UserGroups.findOne({name: group2.name}));

            // verify group1 roles
            assert.isTrue(Roles.userIsInRole(userId, 'owner', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'admin', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'deputy', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'owner', group1MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId2, 'admin', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'deputy', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'owner', group1MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId3, 'admin', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'deputy', group1MongoId._str));

            // verify group2 roles
            assert.isTrue(Roles.userIsInRole(userId, 'owner', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'admin', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'deputy', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'owner', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'admin', group2MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId2, 'deputy', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'owner', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'admin', group2MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId3, 'deputy', group2MongoId._str));

            // verify data stored in group1
            const g1 = UserGroups.findOne(group1);
            assert.equal(g1.owner_id, userId);
            assert.deepEqual(g1.admin_ids, [userId2, userId3]);
            assert.deepEqual(g1.deputy_ids, []);

            // verify data stored in group2 
            const g2 = UserGroups.findOne(group2);
            assert.equal(g2.owner_id, userId);
            assert.deepEqual(g2.admin_ids, []);
            assert.deepEqual(g2.deputy_ids, [userId2, userId3]);
        });

        it('editGroup test', function() {
            const email2 = 'test_account2@test.com'
            const email3 = 'test_account3@test.com'
            const email4 = 'test_account4@test.com'
            const password = '123456'
            const userId2 = Accounts.createUser({email: email2, password : password});
            const userId3 = Accounts.createUser({email: email3, password : password});
            const userId4 = Accounts.createUser({email: email4, password : password});
            
            var group1 = new UserGroup("test1", userId, [userId2, userId3], []);
            var group2 = new UserGroup("test2", userId, [], [userId2, userId3]);

            Meteor.call('userGroups.create', group1);
            Meteor.call('userGroups.create', group2);
            
            const group1MongoId = UserGroups.findOne({name: group1.name})._id;
            const group2MongoId = UserGroups.findOne({name: group2.name})._id;

            // verify group1 roles
            assert.isTrue(Roles.userIsInRole(userId, 'owner', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'admin', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'deputy', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'owner', group1MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId2, 'admin', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'deputy', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'owner', group1MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId3, 'admin', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'deputy', group1MongoId._str));

            // verify group2 roles
            assert.isTrue(Roles.userIsInRole(userId, 'owner', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'admin', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'deputy', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'owner', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'admin', group2MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId2, 'deputy', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'owner', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'admin', group2MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId3, 'deputy', group2MongoId._str));

            // verify data stored in group1
            var g1 = UserGroups.findOne(group1MongoId);
            assert.equal(g1.owner_id, userId);
            assert.deepEqual(g1.admin_ids, [userId2, userId3]);
            assert.deepEqual(g1.deputy_ids, []);

            // verify data stored in group2 
            var g2 = UserGroups.findOne(group2MongoId);
            assert.equal(g2.owner_id, userId);
            assert.deepEqual(g2.admin_ids, []);
            assert.deepEqual(g2.deputy_ids, [userId2, userId3]);

            // -- Now edit the groups so that they "change places"
            // ------------------------------------------------------------
            var newGroup1 = group2;
            newGroup1.owner_id = userId4;
            newGroup1.name = "newName1";

            var newGroup2 = group1;
            newGroup2.name = "newName2";

            Meteor.call('userGroups.update', group1MongoId, newGroup1);
            Meteor.call('userGroups.update', group2MongoId, newGroup2);

            // verify group1 roles
            assert.isTrue(!Roles.userIsInRole(userId, 'owner', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'admin', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'deputy', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'owner', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'admin', group1MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId2, 'deputy', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'owner', group1MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'admin', group1MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId3, 'deputy', group1MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId4, 'owner', group1MongoId._str));

            // verify group2 roles
            assert.isTrue(Roles.userIsInRole(userId, 'owner', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'admin', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId, 'deputy', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'owner', group2MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId2, 'admin', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId2, 'deputy', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'owner', group2MongoId._str));
            assert.isTrue(Roles.userIsInRole(userId3, 'admin', group2MongoId._str));
            assert.isTrue(!Roles.userIsInRole(userId3, 'deputy', group2MongoId._str));

            // verify data stored in group1
            g1 = UserGroups.findOne(group1MongoId);
            assert.equal(g1.name, newGroup1.name);
            assert.equal(g1.owner_id, newGroup1.owner_id);
            assert.deepEqual(g1.admin_ids, newGroup1.admin_ids);
            assert.deepEqual(g1.deputy_ids, newGroup1.deputy_ids);

            // verify data stored in group2 
            g2 = UserGroups.findOne(group2MongoId);
            assert.equal(g2.name, newGroup2.name);
            assert.equal(g2.owner_id, newGroup2.owner_id);
            assert.deepEqual(g2.admin_ids, newGroup2.admin_ids);
            assert.deepEqual(g2.deputy_ids, newGroup2.deputy_ids);

        });

    });
}