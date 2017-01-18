import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

Meteor.methods({
    
    // Completes a task and moves it off of the active task list
    'userTasks.completeTask'(userTaskId) {
        check(userTaskId, Mongo.ObjectID); // TODO:  Figure out MongoId vs String relationship in collections.
        console.log('completing task ' + userTaskId );
       
        userTask = UserTasks.findOne(userTaskId);
        var userId = Meteor.userId();
        var user = Meteor.user();
       
        if (userId != userTask.user_id) {
            throw new Meteor.Error('not-autherized', "The logged-in user does not own this task.");
        }

        task = Tasks.findOne(userTask.task_id);
        if (!task) {
            throw new Meteor.Error('bad-state', "The associated task does not exist")
        }

        // TODO:  Don't get the user object here.  Just atomically increment the XP value.
        if (!userTask.is_completed) {
            var currentXp = 0;
            if (user && user.profile && user.profile.progression && user.profile.progression.xp) {
                currentXp = user.profile.progression.xp;
            }
            var taskXp = task.xp_value || 1;    //TODO:  Make a file that stores default values for DB not-fully-initialized DB elements.
            var newXp = currentXp + taskXp;
            Meteor.users.update(userId, {$set : {"profile.progression.xp" : newXp}})
        }

        UserTasks.update(userTaskId, { $set: {is_completed : true,
                                              is_active:false,
                                               completed_on: new Date()
                                             }
                                     });

        if (userTask.is_active) {
            Meteor.users.update(userId, {$inc: {"statistics.activeTasks": -1} });
            Tasks.update(task._id, {$inc: {"statistics.completion_count": 1}})
        }
    },

    // Removes a task from the active task list.
    'userTasks.cancelTask'(userTaskId) {
        check(userTaskId, Mongo.ObjectID); // TODO:  Figure out MongoId vs String relationship in collections.
        console.log('cancelling task ' + userTaskId );
        
        var userTask = UserTasks.findOne(userTaskId);
        var user = Meteor.user();
        var userId = Meteor.userId();
        
        if (userId != userTask.user_id) {
            throw new Meteor.Error('not-autherized', "The logged-in user does not own this task.");
        }
        
        task = Tasks.findOne(userTask.task_id);
        if (!task) {
            throw new Meteor.Error('bad-state', "The associated task does not exist")
        }

        // TODO:  Make class-like interface that pairs the remove and update call together.
        if (userTask.is_active) {
            UserTasks.update(
                { _id: userTaskId },
                { $set: { "is_active" : false} }
            );
            Meteor.users.update(userId, {$inc: {"statistics.activeTasks": -1} });
        }
    },

    // Moves a task back to the active task list and marks it as not completed.
    // TODO:  Think through the details of this use case.  e.g. Do we change the expiry date? 
    'userTasks.unCompleteTask'(userTaskId) {
        check(userTaskId, Mongo.ObjectID); // TODO:  Figure out MongoId vs String relationship in collections.
        console.log('uncompleting task ' + userTaskId );
        
        var userTask = UserTasks.findOne(userTaskId);
        var user = Meteor.user();
        var userId = Meteor.userId();
        
        if (userId != userTask.user_id) {
            throw new Meteor.Error('not-autherized', "The logged-in user does not own this task.");
        }
        
        task = Tasks.findOne(userTask.task_id);
        if (!task) {
            throw new Meteor.Error('bad-state', "The associated task does not exist")
        }

        // TODO:  Don't get the user object here.  Just atomically increment the XP value.
        if (userTask.is_completed) {
            var currentXp = 0;
            if (user && user.profile && user.profile.progression && user.profile.progression.xp) {
                currentXp = user.profile.progression.xp;
            }
            var taskXp = task.xp_value || 1;    //TODO:  Make a file that stores default values for DB not-fully-initialized DB elements.
            var newXp = currentXp - taskXp;
            Meteor.users.update(userId, {$set : {"profile.progression.xp" : newXp}})

            // TODO:  All of this should really be transactional.
            if (!userTask.is_active) {
                if (userTask.is_completed) {
                    Tasks.update(task._id, {$inc: {"statistics.completion_count": -1}})
                }
                Meteor.users.update(userId, {$inc: {"statistics.activeTasks": 1} });
                UserTasks.update(
                    { _id: userTaskId },
                    { $set: { "is_active" : true, "is_completed": false},
                      $unset: {"completed_on": true}  
                    }
                );
            }
        }
    },

    // TODO:  Create a class-like interface for managing UserTasks, then have the Meteor methods call directly into the class.

    // This user will never again see the given task.
    'userTasks.hideTaskForever'(userTaskId) {
        check(userTaskId, Mongo.ObjectID); // TODO:  Be more specific about the kind of object.  Figure out MongoId vs String relationship in collections.
        userTask = UserTasks.findOne(userTaskId);
        var userId = Meteor.userId();
        if (userId != userTask.user_id) {
            throw new Meteor.Error('not-autherized', "The logged-in user does not own this task.");
        }
        
        // TODO:  Really, create a class-like interface to pair these two calls together.
        UserTasks.update(
            { _id: userTaskId },
            { $set: { "is_active" : false,  "never_show_again" : true} }
        );

        if (userTask.is_active) {
            Meteor.users.update(userId, {$inc: {"statistics.activeTasks": -1} });
        }
    },

    // Directly creates a userTask for the given taskId.
    'userTasks.createUserTask'(taskId) {
        check(taskId, Mongo.ObjectID);
        const userId = Meteor.userId();
        const task = Tasks.findOne(taskId);

        if (!task) {
            throw new Meteor.Error('invalid-parameter', "the given taskId does not have an associated task");
        }

        if (UserTasks.findOne({task_id: taskId})) {
            throw new Meteor.Error('bad-state', "the given user has already received this task.");
        }

        var today = new Date();
        today.setUTCHours(0,0,0,0);
        var tomorrow = new Date(today);
        tomorrow.setUTCHours(23, 59, 59, 999)

        var userTask = {
            user_id: userId,
            task_type: task.task_type,
            task_id: task._id,
            task_statistics: "TBA",
            given_on: new Date(),
            lasts_until: tomorrow,
            is_active : true,
            is_completed: false,
            is_repeatable: false,
            never_show_again: false,
            group_id: task.group_id
        }

        UserTasks.insert(userTask);
        Meteor.users.update(userId, {$inc: {"statistics.activeTasks":1}});
    }
})