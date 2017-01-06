import './tasks.js'
import { Task, PhoneTask, PBTaskTypesEnum } from './taskClasses.js';

import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';

if (Meteor.isServer) {
    describe('task API tests', () => {
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
            Meteor.users.update(userId, {$set: {"profile.permissions.registerNewTasks": true}});
            Meteor.userId = function() { return userId; };
            Meteor.user = function() { return Meteor.users.findOne(userId); };
        })

        it('can create a new phone task', () => {
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
                "foo");
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
                "foo");
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