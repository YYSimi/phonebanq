import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

import { CreateRandomUserTask, UpdateUserTasks } from '../../lib/common.js'

// Handle publication for tasks.  TODO:  Is this the correct file for this?

if (Meteor.isServer) {
    Meteor.publish('userTasks', function userTasksPublication() {
        return UserTasks.find({ user_id : this.userId });
    });
    Meteor.publish('dailyCallPrompts', function () {
        return DailyCallPrompts.find();
    });
    Meteor.publish('weeklyCallPrompts', function() {
        return WeeklyCallPrompts.find();
    });
    Meteor.publish('senators', function() {
        return Senators.find();
    });
    Meteor.publish('representatives', function() {
        return Representatives.find();
    });
}

Meteor.methods({
    // Create a new task for the given user
    // TODO:  Move these to a new "userTasks" class?
    'tasks.createRandom'() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-autherized')
        }
        if (Meteor.isServer) {
            UpdateUserTasks(Meteor.userId());
            CreateRandomUserTask(Meteor.userId());
        }
    },

    'tasks.completeTask'(userTaskId) {
        check(userTaskId, String); // TODO:  should these be numbers?
        console.log('completing task ' + userTaskId );
        userTask = UserTasks.findOne(userTaskId);
        if (Meteor.userId() != userTask.user_id) {
            throw new Meteor.Error('not-autherized',
            "The logged-in user does not own this task.");
        }
        UserTasks.update(userTaskId, { $set: {is_completed : true, is_active:false } });
    },

    'tasks.cancelTask'(userTaskId) {
        check(userTaskId, String); // TODO:  should these be numbers?
        console.log('uncompleting task ' + userTaskId );
        userTask = UserTasks.findOne(userTaskId);
        if (Meteor.userId() != userTask.user_id) {
            throw new Meteor.Error('not-autherized',
            "The logged-in user does not own this task.");
        }
        UserTasks.remove(userTaskId);
    },

    // TODO:  Create a class-like interface for managing UserTasks, then have the Meteor methods call directly into the class.

    'tasks.hideTaskForever'(userTaskId) {
        check(userTaskId, String); // TODO:  should these be numbers?
        console.log('uncompleting task ' + userTaskId );
        userTask = UserTasks.findOne(userTaskId);
        if (Meteor.userId() != userTask.user_id) {
            throw new Meteor.Error('not-autherized',
            "The logged-in user does not own this task.");
        }
        
        UserTasks.update(
            { _id: userTaskId },
            { $set: { "is_active" : "false",  "never_show_again" : true} }
        );

        UpdateUserTasks(userTaskId);
    }
})