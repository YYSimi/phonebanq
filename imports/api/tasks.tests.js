import './tasks.js'
import { Task, PhoneTask, PBTaskTypesEnum } from './taskClasses.js';
import { UserGroup } from './userGroupClasses.js'

import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Roles } from 'meteor/alanning:roles';

if (Meteor.isServer) {
    function canCreateTaskTest(user, group, fShouldSucceed) {
        Meteor.userId = function() {return user._id};
        Meteor.user = function() {return user};

        var taskCookie = "phoneTaskTest"
        var task = new Task(
            taskCookie,
            "",
            new Date(),
            new Date(),
            PBTaskTypesEnum.phone,
            [],
            3,
            1,
            group._id._str);
        var phoneTask = new PhoneTask(
            taskCookie,
            "",
            "",
            "",
            true,
            false,
            [],
            [],
            []);

        if (fShouldSucceed) {
            Meteor.call('tasks.registerNewTask', task, phoneTask);
            assert(Tasks.findOne({tiny_description: taskCookie}), "Task failed to insert");
            assert(PhoneTasks.findOne({general_script: taskCookie}), "PhoneTask failed to insert");
        }
        else {
            assert.throws(() => { Meteor.call('tasks.registerNewTask', task, phoneTask); }, ['access-denied']);
            assert(!Tasks.findOne({tiny_description: taskCookie}), "Task inserted when it shouldn't have");
            assert(!PhoneTasks.findOne({general_script: taskCookie}), "PhoneTask inserted when it shouldn't have");
        }
    }

    describe('task API tests', () => {
        //---- HELPERS
        //-------------------------------------------- //
        var siteAdminUser;
        var groupOwnerUser;
        var groupAdminUser;
        var groupDeputyUser;
        var nonPriviledgedUser;

        var group1;
        var group1MongoId;

        //---- TESTCASES
        //-------------------------------------------- //
        beforeEach(() => {
            var password = '123456';

            resetDatabase();
            const siteAdminUid = Accounts.createUser({email: 'test_account@test.com', password : password});
            const groupOwnerUid = Accounts.createUser({email: 'test_account2@test.com', password : password});
            const groupAdminUid = Accounts.createUser({email: 'test_account3@test.com', password : password});
            const groupDeputyUid = Accounts.createUser({email: 'test_account4@test.com', password : password});
            const nonPrivUid = Accounts.createUser({email: 'test_account5@test.com', password : password});

            siteAdminUser = Meteor.users.findOne(siteAdminUid);
            assert(siteAdminUser, "failed to find user");
            Roles.addUsersToRoles(siteAdminUser, 'site-admin', Roles.GLOBAL_GROUP);

            groupOwnerUser = Meteor.users.findOne(groupOwnerUid);
            assert(groupOwnerUser, "failed to find user");

            groupAdminUser = Meteor.users.findOne(groupAdminUid);
            assert(groupAdminUser, "failed to find user");

            groupDeputyUser = Meteor.users.findOne(groupDeputyUid);
            assert(groupDeputyUser, "failed to find user");

            nonPriviledgedUser = Meteor.users.findOne(nonPrivUid);
            assert(nonPriviledgedUser, "failed to find user");

            Meteor.userId = function() { return siteAdminUid; };
            Meteor.user = function() { return Meteor.users.findOne(siteAdminUid); };

            const group1Struct = new UserGroup("test1", groupOwnerUid, [groupAdminUid], [groupDeputyUid]);
            Meteor.call('userGroups.create', group1Struct);
            group1 = UserGroups.findOne({name: group1Struct.name});
            group1MongoId = group1._id;
        })

        it('site admin can create a new phone task', () => {
            canCreateTaskTest(siteAdminUser, group1, true);
        })

        it('group owner can create a new phone task', () => {
            canCreateTaskTest(groupOwnerUser, group1, true);
        })

        it('group admin can create a new phone task', () => {
            canCreateTaskTest(groupAdminUser, group1, true);
        })

        it('group deputy can create a new phone task', () => {
            canCreateTaskTest(groupDeputyUser, group1, true);
        })

        it('nonpriviledged users cannot create a new phone task', () => {
            canCreateTaskTest(nonPriviledgedUser, group1, false);
        })

        it('can edit phone tasks that you created', () => {
            var taskCookie = "phoneTaskTest2"
            var taskCookie2 = "IveBeenChanged!"
            var task = new Task(
                taskCookie,
                "",
                new Date(),
                new Date(),
                PBTaskTypesEnum.phone,
                [],
                3,
                1,
                group1MongoId._str);
            var phoneTask = new PhoneTask(
                taskCookie,
                "",
                "",
                "",
                true,
                false,
                [],
                [],
                []);
            Meteor.call('tasks.registerNewTask', task, phoneTask);
            assert(Tasks.findOne({tiny_description: taskCookie}), "Task failed to insert");
            assert(PhoneTasks.findOne({general_script: taskCookie}), "PhoneTask failed to insert");

            task.tiny_description = taskCookie2;
            phoneTask.general_script = taskCookie2;
            Meteor.call('tasks.editTask', Tasks.findOne({tiny_description: taskCookie})._id, task, phoneTask);

            assert(!Tasks.findOne({tiny_description: taskCookie}), "Old Task is still around");
            assert(!PhoneTasks.findOne({general_script: taskCookie}), "Old PhoneTask is still around");

            assert(Tasks.findOne({tiny_description: taskCookie2}), "Task failed to change");
            assert(PhoneTasks.findOne({general_script: taskCookie2}), "PhoneTask failed to change");
        });


    });
}